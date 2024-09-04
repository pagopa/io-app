import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import { constNull } from "fp-ts/lib/function";

// eID key tags
export const WIA_EID_KEYTAG = "WIA_EID_KEYTAG";
export const DPOP_EID_KEYTAG = "DPOP_EID_KEYTAG";

// Credentials key tags
export const WIA_CREDENTIAL_KEYTAG = "WIA_CREDENTIAL_KEYTAG";
export const DPOP_CREDENTIAL_KEYTAG = "DPOP_CREDENTIAL_KEYTAG";

export const regenerateCryptoKey = (keyTag: string) =>
  deleteKey(keyTag)
    .catch(constNull)
    .finally(() => generate(keyTag));
