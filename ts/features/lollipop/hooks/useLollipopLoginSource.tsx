import * as O from "fp-ts/lib/Option";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { LoggedOutWithIdp } from "../../../store/reducers/authentication";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskGetPublicKey } from "../../../utils/crypto";
import { getIdpLoginUri } from "../../../utils/login";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { LoginSourceAsync } from "../types/LollipopLoginSource";

type Props = {
  loggedOutWithIdpAuth?: LoggedOutWithIdp;
};

const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";

export const useLollipopLoginSource = ({ loggedOutWithIdpAuth }: Props) => {
  const [loginSource, setLoginSource] = useState<LoginSourceAsync>({
    kind: "initial"
  });

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const lollipopKeyTag = useIOSelector(lollipopKeyTagSelector);

  const loginUri = loggedOutWithIdpAuth
    ? getIdpLoginUri(loggedOutWithIdpAuth.idp.id)
    : undefined;

  useEffect(() => {
    if (loginUri && isLollipopEnabled && O.isSome(lollipopKeyTag)) {
      taskGetPublicKey(lollipopKeyTag.value)
        .then(key => {
          setLoginSource({
            kind: "ready",
            value: {
              uri: loginUri,
              headers: {
                "x-pagopa-lollipop-pub-key": Buffer.from(
                  JSON.stringify(key)
                ).toString("base64"),
                "x-pagopa-lollipop-pub-key-hash-algo":
                  DEFAULT_LOLLIPOP_HASH_ALGORITHM
              }
            }
          });
        })
        .catch(_ => {
          setLoginSource({
            kind: "ready",
            value: {
              uri: loginUri
            }
          });
        });
    }
  }, [isLollipopEnabled, lollipopKeyTag, loginUri]);

  return loginSource;
};
