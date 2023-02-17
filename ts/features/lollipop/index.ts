import { PublicKey } from "@pagopa/io-react-native-crypto";
import URLParse from "url-parse";
import { SignatureAlgorithm } from "../../utils/httpSignature/types/SignatureAlgorithms";
import { SignatureComponents } from "../../utils/httpSignature/types/SignatureComponents";

export type LollipopConfig = {
  nonce: string;
  customContentToSign?: ReadonlyArray<string>;
};

/**
 * Utility function to forge the `SignatureComponents` based on the provided inputs.
 */
export function toSignatureComponents(
  method: string,
  inputUrl: URLParse,
  originalUrl: string
): SignatureComponents {
  return {
    method,
    authority: inputUrl.hostname,
    path: inputUrl.pathname,
    requestTarget: originalUrl,
    scheme: inputUrl.protocol,
    targetUri: `${inputUrl.protocol}://${inputUrl.hostname}/${originalUrl}`
  };
}

/**
 * Returns the http-signature algorithm used to sign the signature base specified by
 * the signature-input header.
 */
export function getSignAlgorithm(publicKey: PublicKey): SignatureAlgorithm {
  return publicKey.kty === "EC" ? "ecdsa-p256-sha256" : "rsa-pss-sha256";
}

/**
 * Result type of promises returnd by `chainSignPromises`
 */
export type SignPromiseResult = {
  headerIndex: number;
  headerName: string;
  headerValue: string;
  signature: string;
  "signature-input": string;
};

/**
 * Chains all custom sign promises passed as its input array.
 */
export function chainSignPromises(
  promises: Array<Promise<SignPromiseResult>>
): Promise<Array<SignPromiseResult>> {
  return Promise.all(promises)
    .then(results => results)
    .catch(error => Promise.reject(error));
}
