import * as O from "fp-ts/lib/Option";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskGetPublicKey } from "../../../utils/crypto";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";

export const useLollipopPublicKey = () => {
  const [publicKey, setPublicKey] = useState<PublicKey | undefined>(undefined);

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const lollipopKeyTag = useIOSelector(lollipopKeyTagSelector);

  useEffect(() => {
    if (isLollipopEnabled && O.isSome(lollipopKeyTag)) {
      taskGetPublicKey(lollipopKeyTag.value)
        .then(key => {
          setPublicKey(key);
        })
        .catch(_ => {
          setPublicKey(undefined);
        });
    }
  }, [isLollipopEnabled, lollipopKeyTag]);

  return publicKey;
};
