import {
  CryptoError,
  isKeyStrongboxBacked,
  PublicKey
} from "@pagopa/io-react-native-crypto";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";

import {
  trackLollipopIsKeyStrongboxBackedFailure,
  trackLollipopIsKeyStrongboxBackedSuccess
} from "../../../utils/analytics";
import { isAndroid } from "../../../utils/platform";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT } from "./login";

export type KeyInfo = {
  keyTag?: string;
  publicKey?: PublicKey;
  publicKeyThumbprint?: string;
};

export const toCryptoError = (e: unknown) => e as CryptoError;

export const toBase64EncodedThumbprint = (key: PublicKey) =>
  jwkThumbprintByEncoding(
    key,
    DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
    "base64url"
  );

export const toThumbprint = (key: PublicKey | undefined) => {
  if (key === undefined) {
    return undefined;
  }
  const base64EncodedThumbprint = toBase64EncodedThumbprint(key);
  return base64EncodedThumbprint;
};

/**
 * Check if the key is backed by Strongbox and track the result only on Android.
 * @param keyTag - the keyTag of the key to check.
 */
export const handleIsKeyStrongboxBacked = async (keyTag?: string) => {
  if (keyTag && isAndroid) {
    try {
      const isStrongBoxBacked = await isKeyStrongboxBacked(keyTag);
      trackLollipopIsKeyStrongboxBackedSuccess(isStrongBoxBacked);
    } catch (e) {
      trackLollipopIsKeyStrongboxBackedFailure(toCryptoError(e).message);
    }
  }
};
