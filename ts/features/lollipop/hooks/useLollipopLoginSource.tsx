import * as O from "fp-ts/lib/Option";
import { useCallback, useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { LoggedOutWithIdp } from "../../../store/reducers/authentication";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskGetPublicKey } from "../../../utils/crypto";
import { getIdpLoginUri } from "../../../utils/login";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { LoginSourceAsync } from "../types/LollipopLoginSource";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";

type Props = {
  loggedOutWithIdpAuth?: LoggedOutWithIdp;
};

export const useLollipopLoginSource = ({ loggedOutWithIdpAuth }: Props) => {
  const [loginSource, setLoginSource] = useState<LoginSourceAsync>({
    kind: "initial"
  });

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const lollipopKeyTag = useIOSelector(lollipopKeyTagSelector);

  const loginUri = loggedOutWithIdpAuth
    ? getIdpLoginUri(loggedOutWithIdpAuth.idp.id)
    : undefined;

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

    taskGetPublicKey(lollipopKeyTag.value)
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
