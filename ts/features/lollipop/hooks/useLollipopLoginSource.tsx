import { PublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import { useCallback, useState } from "react";
import URLParse from "url-parse";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  ephemeralKeyTagSelector,
  ephemeralPublicKeySelector
} from "../store/reducers/lollipop";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  lollipopSamlVerify
} from "../utils/login";
import { LollipopCheckStatus } from "../types/LollipopCheckStatus";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { handleRegenerateEphemeralKey } from "..";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../authentication/login/cie/utils";
import { selectedIdentityProviderSelector } from "../../authentication/common/store/selectors";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../authentication/activeSessionLogin/store/selectors";
import { hashedProfileFiscalCodeSelector } from "../../../store/reducers/crossSessions";
import { getLoginHeaders } from "../../authentication/common/utils/login";

export const useLollipopLoginSource = (
  onLollipopCheckFailure: () => void,
  loginUri?: string
) => {
  const [lollipopCheckStatus, setLollipopCheckStatus] =
    useState<LollipopCheckStatus>({ status: "none", url: O.none });
  const [webviewSource, setWebviewSource] = useState<WebViewSource | undefined>(
    undefined
  );

  const dispatch = useIODispatch();
  const ephemeralKeyTag = useIOSelector(ephemeralKeyTagSelector);
  const maybeEphemeralPublicKey = useIOSelector(ephemeralPublicKeySelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const idp = useIOSelector(selectedIdentityProviderSelector);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const hashedFiscalCode = useIOSelector(hashedProfileFiscalCodeSelector);
  const isActiveSessionFastLogin = useIOSelector(
    isActiveSessionFastLoginEnabledSelector
  );

  const verifyLollipop = useCallback(
    (eventUrl: string, urlEncodedSamlRequest: string, publicKey: PublicKey) => {
      setWebviewSource(undefined);
      lollipopSamlVerify(
        urlEncodedSamlRequest,
        publicKey,
        () => {
          setLollipopCheckStatus({
            status: "trusted",
            url: O.some(eventUrl)
          });
          setWebviewSource({ uri: eventUrl });
        },
        (reason: string) => {
          trackLollipopIdpLoginFailure(reason);
          setLollipopCheckStatus({
            status: "untrusted",
            url: O.some(eventUrl)
          });
          onLollipopCheckFailure();
        }
      );
    },
    [onLollipopCheckFailure]
  );

  const regenerateLoginSource = useCallback(() => {
    if (!loginUri) {
      // When the redux state is LoggedOutWithIdp the loginUri is always defined.
      // After the user has logged in, the status changes to LoggedIn and the loginUri is not
      // defined any more.
      // Therefore we must block the code flow in order for the hook to not do anything else.
      return;
    }

    /**
     * We generate a new key pair for every new login/relogin/retry we
     * need to garantee the public key uniqueness on every login request.
     * https://pagopa.atlassian.net/browse/LLK-37
     */

    void pipe(
      () =>
        handleRegenerateEphemeralKey(
          ephemeralKeyTag,
          mixpanelEnabled,
          dispatch
        ),
      T.map(nullableKey =>
        pipe(
          nullableKey,
          O.fromNullable,
          O.fold(
            () =>
              setWebviewSource({
                uri: loginUri
              }),
            key =>
              setWebviewSource({
                uri: loginUri,
                headers: getLoginHeaders(
                  key,
                  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
                  isActiveSessionLogin ? isActiveSessionFastLogin : isFastLogin,
                  cieFlowForDevServerEnabled ? idp?.id : undefined,
                  isActiveSessionLogin ? hashedFiscalCode : undefined
                )
              })
          )
        )
      )
    )();
  }, [
    dispatch,
    ephemeralKeyTag,
    isActiveSessionFastLogin,
    hashedFiscalCode,
    idp?.id,
    isActiveSessionLogin,
    isFastLogin,
    loginUri,
    mixpanelEnabled
  ]);

  const retryLollipopLogin = useCallback(() => {
    setLollipopCheckStatus({ status: "none", url: O.none });
    // We must set webviewSource to undefined before requesting
    // any changes to loginSource otherwise on the next component
    // refresh (triggered by a different value of loginSource),
    // the old value of webviewSource is going to be loaded
    // (i.e., the loaded webViewSource uri will be different from
    // the loginSource.uri)
    setWebviewSource(undefined);
    regenerateLoginSource();
  }, [regenerateLoginSource]);

  const shouldBlockUrlNavigationWhileCheckingLollipop = useCallback(
    (url: string) => {
      const parsedUrl = new URLParse(url, true);
      const urlQuery = parsedUrl.query;
      const urlEncodedSamlRequest = urlQuery?.SAMLRequest;
      if (urlEncodedSamlRequest) {
        if (lollipopCheckStatus.status === "none") {
          // Make sure that we have a public key (since its retrieval
          // may have failed - in which case let the flow go through
          // the non-lollipop standard check process)
          if (maybeEphemeralPublicKey) {
            // Start Lollipop verification process
            setLollipopCheckStatus({
              status: "checking",
              url: O.some(url)
            });
            verifyLollipop(url, urlEncodedSamlRequest, maybeEphemeralPublicKey);
            // Prevent the WebView from loading the current URL (its
            // loading will be restored after LolliPOP verification
            // has succeded)
            return true;
          }
          // If code reaches this point, then either the public key
          // retrieval has failed or lollipop is not enabled. Let
          // the code flow follow the standard non-lollipop scenario
        } else if (lollipopCheckStatus.status === "checking") {
          // LolliPOP signature is being verified, prevent the WebView
          // from loading the current URL,
          return true;
        }

        // If code reaches this point, either there is no public key
        // or lollipop is not enabled or the LolliPOP signature has
        // been verified (in both cases, let the code flow). Code
        // flow shall never hit this method is LolliPOP signature
        // verification has failed, since an error is displayed and
        // the WebViewSource is left undefined
      }

      return false;
    },
    [lollipopCheckStatus.status, maybeEphemeralPublicKey, verifyLollipop]
  );

  useOnFirstRender(() => {
    regenerateLoginSource();
  });

  return {
    lollipopCheckStatus,
    retryLollipopLogin,
    shouldBlockUrlNavigationWhileCheckingLollipop,
    webviewSource
  };
};
