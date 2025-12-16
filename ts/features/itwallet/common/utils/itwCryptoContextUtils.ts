import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import { constNull } from "fp-ts/lib/function";

// Key tags
export const WIA_KEYTAG = "WIA_KEYTAG";
export const DPOP_KEYTAG = "DPOP_KEYTAG";

export const regenerateCryptoKey = (keyTag: string) =>
  deleteKey(keyTag)
    .catch(constNull)
    .finally(() => generate(keyTag));
