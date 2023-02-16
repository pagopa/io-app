import * as O from "fp-ts/lib/Option";
import { useCallback, useEffect, useState } from "react";
import { lollipopLoginEnabled } from "../../../config";
import { useIOSelector } from "../../../store/hooks";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskRegenerateKey } from "../../../utils/crypto";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { LoginSourceAsync } from "../types/LollipopLoginSource";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";

export const useLollipopLoginSource = (loginUri?: string) => {
  const [loginSource, setLoginSource] = useState<LoginSourceAsync>({
    kind: "initial"
  });

  const useLollipopLogin =
    useIOSelector(isLollipopEnabledSelector) && lollipopLoginEnabled;
  const lollipopKeyTag = useIOSelector(lollipopKeyTagSelector);

  const setDeprecatedLoginUri = useCallback((uri: string) => {
    setLoginSource({
      kind: "ready",
      value: {
        uri
      },
      publicKey: O.none
    });
  }, []);

  useEffect(() => {
    if (!loginUri) {
      // When the redux state is LoggedOutWithIdp the loginUri is always defined.
      // After the user has logged in, the status changes to LoggedIn and the loginUri is not
      // defined any more.
      // Therefore we must block the code flow in order for the hook to not do anything else.
      return;
    }

    if (!useLollipopLogin || O.isNone(lollipopKeyTag)) {
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
    taskRegenerateKey(lollipopKeyTag.value)
      .then(key => {
        if (!key) {
          setDeprecatedLoginUri(loginUri);
          return;
        }
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
      })
      .catch(_ => {
        setDeprecatedLoginUri(loginUri);
      });
  }, [useLollipopLogin, lollipopKeyTag, loginUri, setDeprecatedLoginUri]);

  return loginSource;
};
