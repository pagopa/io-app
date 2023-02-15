import * as O from "fp-ts/lib/Option";
import { useCallback, useEffect, useState } from "react";
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

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
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
      // This case should never happen. Nonetheless, loginUri data
      // source can return an undefined so we must make sure to handle
      // the 0.001% happening-case
      setLoginSource({
        kind: "error"
      });
      return;
    }

    if (!isLollipopEnabled || O.isNone(lollipopKeyTag)) {
      // Key generation may have failed. In that case, follow the old
      // non-lollipop login flow
      setDeprecatedLoginUri(loginUri);
      return;
    }

    /**
     * We generata a new key pair for every new login/relogin/retry we
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
  }, [isLollipopEnabled, lollipopKeyTag, loginUri, setDeprecatedLoginUri]);

  return loginSource;
};
