import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import URLParse from "url-parse";
import { SignatureAlgorithm } from "./httpSignature/types/SignatureAlgorithms";
import { SignatureComponents } from "./httpSignature/types/SignatureComponents";

export type LollipopConfig = {
  nonce: string;
  customContentToSign?: Record<string, string>;
};

/**
 * Utility function to forge the `SignatureComponents` based on the provided inputs.
 */
export function toSignatureComponents(
  method: string,
  inputUrl: URLParse
): SignatureComponents {
  return {
    method,
    authority: inputUrl.host,
    path: inputUrl.pathname,
    scheme: inputUrl.protocol,
    targetUri: inputUrl.toString(),
    originalUrl: inputUrl.toString()
  };
}

/**
 * Returns the http-signature algorithm used to sign the signature base specified by
 * the signature-input header.
 */
export function getSignAlgorithm(publicKey: PublicKey): SignatureAlgorithm {
  return publicKey.kty === "EC" ? "ecdsa-p256-sha256" : "rsa-pss-sha256";
}

export type SignPromiseResult = {
  headerIndex: number;
  headerPrefix: string;
  headerName: string;
  headerValue: string;
  signature: string;
  signatureInput: string;
};

/**
 * Chains all custom sign promises passed as its input array.
 */
export const chainSignPromises = (
  promises: Array<TE.TaskEither<Error, SignPromiseResult>>
) =>
  pipe(
    promises,
    A.sequence(TE.ApplicativePar),
    TE.getOrElse(() => T.of([] as Array<SignPromiseResult>))
  )();
