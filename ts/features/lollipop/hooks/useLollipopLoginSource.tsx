import { useEffect, useState } from "react";
import { lollipopSelector } from "../../../store/actions/lollipop";
import { useIOSelector } from "../../../store/hooks";
import { LoggedOutWithIdp } from "../../../store/reducers/authentication";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskGetPublicKey } from "../../../utils/crypto";
import { getIdpLoginUri } from "../../../utils/login";
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
  const lollipopState = useIOSelector(lollipopSelector);

  const loginUri = loggedOutWithIdpAuth
    ? getIdpLoginUri(loggedOutWithIdpAuth.idp.id)
    : undefined;

  useEffect(() => {
    if (
      loginUri &&
      isLollipopEnabled &&
      lollipopState &&
      lollipopState.keyTag
    ) {
      taskGetPublicKey(lollipopState.keyTag)
        .then(k => {
          setLoginSource({
            kind: "ready",
            value: {
              uri: loginUri,
              headers: {
                "x-pagopa-lollipop-pub-key": Buffer.from(
                  JSON.stringify(k)
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
  }, [isLollipopEnabled, lollipopState, loginUri]);

  return loginSource;
};
