import { generate, deleteKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useState } from "react";
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
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { LoginSourceAsync } from "../types/LollipopLoginSource";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";

const taskRegenerateKey = (keyTag: string) =>
  pipe(
    TE.tryCatch(() => deleteKey(keyTag), toCryptoError),
    TE.chain(() => TE.tryCatch(() => generate(keyTag), toCryptoError))
  );

export const useLollipopLoginSource = (loginUri?: string) => {
  const [loginSource, setLoginSource] = useState<LoginSourceAsync>({
    kind: "initial"
  });

  const dispatch = useIODispatch();
  const useLollipopLogin = useIOSelector(isLollipopEnabledSelector);
  const lollipopKeyTag = useIOSelector(lollipopKeyTagSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  const setDeprecatedLoginUri = (uri: string) => {
    setLoginSource({
      kind: "ready",
      value: {
        uri
      },
      publicKey: O.none
    });
  };

  const regenerateLoginSource = () => {
    if (!loginUri) {
      // When the redux state is LoggedOutWithIdp the loginUri is always defined.
      // After the user has logged in, the status changes to LoggedIn and the loginUri is not
      // defined any more.
      // Therefore we must block the code flow in order for the hook to not do anything else.
      return;
    }

    if (!useLollipopLogin || O.isNone(lollipopKeyTag)) {
      if (useLollipopLogin) {
        // We track missing key tag event only if lollipop is enabled
        // (since the key tag is not used without lollipop)
        trackLollipopIdpLoginFailure(
          "Missing key tag while trying to login with lollipop"
        );
      }

      // Key generation may have failed. In that case, follow the old
      // non-lollipop login flow
      setDeprecatedLoginUri(loginUri);
      return;
    }

    /**
     * We generate a new key pair for every new login/relogin/retry we
     * need to garantee the public key uniqueness on every login request.
     * https://pagopa.atlassian.net/browse/LLK-37
     */
    void pipe(
      lollipopKeyTag.value,
      taskRegenerateKey,
      TE.map(key => {
        setLoginSource({
          kind: "ready",
          value: {
            uri: loginUri,
            headers: {
              "x-pagopa-lollipop-pub-key": Buffer.from(
                JSON.stringify(key)
              ).toString("base64"),
              "x-pagopa-lollipop-pub-key-hash-algo":
                DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
            }
          },
          publicKey: O.some(key)
        });
        dispatch(lollipopSetPublicKey({ publicKey: key }));
        if (mixpanelEnabled) {
          trackLollipopKeyGenerationSuccess(key.kty);
        }
      }),
      TE.mapLeft(error => {
        trackLollipopIdpLoginFailure(error.message);
        if (mixpanelEnabled) {
          trackLollipopKeyGenerationFailure(error.message);
        }
        setDeprecatedLoginUri(loginUri);
        dispatch(lollipopRemovePublicKey());
      })
    )();
  };

  useOnFirstRender(() => {
    regenerateLoginSource();
  });

  return { loginSource, regenerateLoginSource };
};
