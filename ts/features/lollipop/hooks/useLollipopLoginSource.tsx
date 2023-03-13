import { generate, deleteKey, PublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useCallback, useState } from "react";
import URLParse from "url-parse";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import {
  trackLollipopIdpLoginFailure,
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../../utils/analytics";
import { toCryptoError } from "../utils/crypto";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  lollipopRemovePublicKey,
  lollipopSetPublicKey
} from "../store/actions/lollipop";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  lollipopSamlVerify
} from "../utils/login";
import { LollipopCheckStatus } from "../types/LollipopCheckStatus";

const taskRegenerateKey = (keyTag: string) =>
  pipe(
    TE.tryCatch(() => deleteKey(keyTag), toCryptoError),
    TE.chain(() => TE.tryCatch(() => generate(keyTag), toCryptoError))
  );

export const useLollipopLoginSource = (
  onLolliPoPCheckFailure: () => void,
  loginUri?: string
) => {
  console.log(`=== useLollipopLoginSource`);
  const [lollipopCheckStatus, setLollipopCheckStatus] =
    useState<LollipopCheckStatus>({ status: "none", url: O.none });
  const [webviewSource, setWebviewSource] = useState<WebViewSource | undefined>(
    undefined
  );

  const dispatch = useIODispatch();
  const useLollipopLogin = useIOSelector(isLollipopEnabledSelector);
  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);

  const verifyLollipop = useCallback(
    (eventUrl: string, urlEncodedSamlRequest: string, publicKey: PublicKey) => {
      console.log(`=== useLollipopLoginSource verifyLollipop`);
      setWebviewSource(undefined);
      lollipopSamlVerify(
        urlEncodedSamlRequest,
        publicKey,
        () => {
          console.log(`=== useLollipopLoginSource verifyLollipop success`);
          setLollipopCheckStatus({
            status: "trusted",
            url: O.some(eventUrl)
          });
          setWebviewSource({ uri: eventUrl });
        },
        (reason: string) => {
          console.log(`=== useLollipopLoginSource verifyLollipop FAILURE`);
          trackLollipopIdpLoginFailure(reason);
          setLollipopCheckStatus({
            status: "untrusted",
            url: O.some(eventUrl)
          });
          onLolliPoPCheckFailure();
        }
      );
    },
    [onLolliPoPCheckFailure]
  );

  const regenerateLoginSource = useCallback(() => {
    console.log(`=== useLollipopLoginSource regenerateLoginSource`);
    if (!loginUri) {
      console.log(
        `=== useLollipopLoginSource regenerateLoginSource NO LOGIN URI`
      );
      // When the redux state is LoggedOutWithIdp the loginUri is always defined.
      // After the user has logged in, the status changes to LoggedIn and the loginUri is not
      // defined any more.
      // Therefore we must block the code flow in order for the hook to not do anything else.
      return;
    }

    if (!useLollipopLogin || O.isNone(maybeKeyTag)) {
      console.log(
        `=== useLollipopLoginSource regenerateLoginSource (${!useLollipopLogin}) (${O.isNone(
          maybeKeyTag
        )})`
      );
      if (useLollipopLogin) {
        // We track missing key tag event only if lollipop is enabled
        // (since the key tag is not used without lollipop)
        trackLollipopIdpLoginFailure(
          "Missing key tag while trying to login with lollipop"
        );
      }

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
      maybeKeyTag.value,
      taskRegenerateKey,
      TE.map(key => {
        dispatch(lollipopSetPublicKey({ publicKey: key }));
        trackLollipopKeyGenerationSuccess(key.kty);
        setWebviewSource({
          uri: loginUri,
          headers: {
            "x-pagopa-lollipop-pub-key": Buffer.from(
              JSON.stringify(key)
            ).toString("base64"),
            "x-pagopa-lollipop-pub-key-hash-algo":
              DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
          }
        });
      }),
      TE.mapLeft(error => {
        dispatch(lollipopRemovePublicKey());
        trackLollipopKeyGenerationFailure(error.message);
        trackLollipopIdpLoginFailure(error.message);
        setWebviewSource({
          uri: loginUri
        });
      })
    )();
  }, [dispatch, loginUri, maybeKeyTag, useLollipopLogin]);

  const retryLolliPoPLogin = useCallback(() => {
    console.log(`=== useLollipopLoginSource retryLolliPoPLogin`);
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

  const shouldBlockUrlNavigationWhileCheckingLolliPoP = useCallback(
    (url: string) => {
      console.log(
        `=== useLollipopLoginSource shouldBlockUrlNavigationWhileCheckingLolliPoP`
      );
      const parsedUrl = new URLParse(url, true);
      const urlQuery = parsedUrl.query;
      const urlEncodedSamlRequest = urlQuery?.SAMLRequest;
      if (urlEncodedSamlRequest) {
        if (lollipopCheckStatus.status === "none") {
          // Make sure that we have a public key (since its retrieval
          // may have failed - in which case let the flow go through
          // the non-lollipop standard check process)
          if (O.isSome(maybePublicKey)) {
            // Start Lollipop verification process
            setLollipopCheckStatus({
              status: "checking",
              url: O.some(url)
            });
            verifyLollipop(url, urlEncodedSamlRequest, maybePublicKey.value);
            console.log(
              `=== useLollipopLoginSource shouldBlockUrlNavigationWhileCheckingLolliPoP return TRUE (has to verify)`
            );
            // Prevent the WebView from loading the current URL (its
            // loading will be restored after LolliPOP verification
            // has succeded)
            return true;
          }
          // If code reaches this point, then either the public key
          // retrieval has failed or lollipop is not enabled. Let
          // the code flow follow the standard non-lollipop scenario
        } else if (lollipopCheckStatus.status === "checking") {
          console.log(
            `=== useLollipopLoginSource shouldBlockUrlNavigationWhileCheckingLolliPoP return TRUE (checking)`
          );
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

      console.log(
        `=== useLollipopLoginSource shouldBlockUrlNavigationWhileCheckingLolliPoP return false`
      );
      return false;
    },
    [lollipopCheckStatus.status, maybePublicKey, verifyLollipop]
  );

  useOnFirstRender(() => {
    console.log(`=== useLollipopLoginSource useOnFirstRender`);
    regenerateLoginSource();
  });

  return {
    lollipopCheckStatus,
    retryLolliPoPLogin,
    shouldBlockUrlNavigationWhileCheckingLolliPoP,
    webviewSource
  };
};
