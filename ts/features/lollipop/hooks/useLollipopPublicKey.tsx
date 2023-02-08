import { PublicKey } from "@pagopa/io-react-native-crypto";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { isLollipopEnabledSelector } from "../../../store/reducers/backendStatus";
import { taskGetPublicKey } from "../../../utils/crypto";
import { lollipopSelector } from "../store/reducers/lollipop";

export const useLollipopPublicKey = () => {
  const [publicKey, setPublicKey] = useState<PublicKey | undefined>(undefined);

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const lollipopState = useIOSelector(lollipopSelector);

  useEffect(() => {
    if (isLollipopEnabled && lollipopState && lollipopState.keyTag) {
      taskGetPublicKey(lollipopState.keyTag)
        .then(k => {
          setPublicKey(k);
        })
        .catch(_ => {
          setPublicKey(undefined);
        });
    }
  }, [isLollipopEnabled, lollipopState]);

  return publicKey;
};
