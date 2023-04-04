import { PublicKey, CryptoError } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { jwkThumbprintByEncoding } from "jwk-thumbprint";
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

export const toThumbprint = (key: O.Option<PublicKey>) =>
  pipe(
    key,
    O.chainNullableK(toBase64EncodedThumbprint),
    O.fold(
      () => undefined,
      thumbprint => thumbprint
    )
  );
