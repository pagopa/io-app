import { PublicKey, CryptoError } from "@pagopa/io-react-native-crypto";

export type KeyInfo = {
  keyTag?: string;
  publicKey?: PublicKey;
  publicKeyThumbprint?: string;
};

export const toCryptoError = (e: unknown) => e as CryptoError;
