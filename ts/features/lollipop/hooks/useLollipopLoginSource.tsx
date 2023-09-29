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
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  lollipopSamlVerify
} from "../utils/login";
import { LollipopCheckStatus } from "../types/LollipopCheckStatus";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { getLollipopLoginHeaders, handleRegenerateKey } from "..";
import { isFastLoginEnabledSelector } from "../../fastLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../cieLogin/utils";
import { selectedIdentityProviderSelector } from "../../../store/reducers/authentication";

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
  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const idp = useIOSelector(selectedIdentityProviderSelector);

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

    if (O.isNone(maybeKeyTag) || O.isNone(maybePublicKey)) {
      // We track missing key tag event only if lollipop is enabled
      // (since the key tag is not used without lollipop)
      trackLollipopIdpLoginFailure(
        "Missing key tag while trying to login with lollipop"
      );

      // Key generation may have failed. In that case, follow the old
      // non-lollipop login flow
      setWebviewSource({
        uri: loginUri
      });
      return;
    }

    /**
     * We generate a new key pair for every new login/relogin/retry we
     * need to garantee the public key uniqueness on every login request.
     * https://pagopa.atlassian.net/browse/LLK-37
     */

    void pipe(
      () => handleRegenerateKey(maybeKeyTag.value, mixpanelEnabled, dispatch),
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
                headers: getLollipopLoginHeaders(
                  key,
                  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
                  isFastLogin,
                  cieFlowForDevServerEnabled ? idp?.id : undefined
                )
              })
          )
        )
      )
    )();
  }, [
    dispatch,
    idp,
    isFastLogin,
    loginUri,
    maybeKeyTag,
    maybePublicKey,
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
          if (O.isSome(maybeKeyTag) && O.isSome(maybePublicKey)) {
            // Start Lollipop verification process
            setLollipopCheckStatus({
              status: "checking",
              url: O.some(url)
            });
            verifyLollipop(url, urlEncodedSamlRequest, maybePublicKey.value);
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
    [lollipopCheckStatus.status, maybeKeyTag, maybePublicKey, verifyLollipop]
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
