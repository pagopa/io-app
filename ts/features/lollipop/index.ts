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
    targetUri: normalizeForTargetUri(inputUrl),
    originalUrl: getOriginalUrl(inputUrl)
  };
}

export function getOriginalUrl(inputUrl: URLParse) {
  const newUrl = new URL(inputUrl.toString());
  if (newUrl.port === "80") {
    return new URL(newUrl.toString().replace(`:${newUrl.port}`, "")).toString();
  }

  return newUrl.toString();
}

/* eslint-disable functional/immutable-data */
export function normalizeForTargetUri(url: URLParse): string {
  const normalizedUrl = new URL(url.href);
  normalizedUrl.port = "";

  const decodedPathname = decodeURIComponent(
    normalizedUrl.pathname.substring(1)
  );
  const encodedPathname = encodeURIComponent(decodedPathname);

  const uppercaseEncodedPathname = encodedPathname.replace(
    /%[0-9a-f]{2}/gi,
    match => match.toUpperCase()
  );
  normalizedUrl.pathname = uppercaseEncodedPathname;

  normalizedUrl.hostname = normalizedUrl.hostname.toLocaleLowerCase();

  return normalizedUrl.toString();
}
/* eslint-enable */

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
