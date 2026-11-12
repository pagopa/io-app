import { requireNativeModule } from "expo-modules-core";

import type {
  CertificateValidationResult,
  CertificateValidationStatus,
  PublicKey,
  X509CertificateOptions
} from "./Crypto.types";

export * from "./Crypto.types";

interface CryptoModuleType {
  deletePublicKey: (keyTag: string) => NativeResult<void>;
  generate: (keyTag: string) => NativeResult<PublicKey>;
  getPublicKey: (keyTag: string) => NativeResult<PublicKey>;
  getPublicKeyFixed: (keyTag: string) => NativeResult<PublicKey>;
  isKeyStrongboxBacked: (keyTag: string) => NativeResult<boolean>;
  signUTF8Text: (message: string, keyTag: string) => NativeResult<string>;
  verifyCertificateChain: (
    certChainBase64: Array<string>,
    trustAnchorBase64: string,
    options: X509CertificateOptions
  ) => NativeResult<NativeCertificateValidationResult>;
}

/** Both native implementations return the validation status as `status`. */
interface NativeCertificateValidationResult {
  errorMessage: string;
  isValid: boolean;
  status: CertificateValidationStatus;
}

interface NativeCryptoFailure {
  cryptoError: {
    code: string;
    message: string;
    userInfo: Record<string, unknown>;
  };
}

type NativeResult<Value> = Promise<NativeCryptoFailure | Value>;

const CryptoModule = requireNativeModule<CryptoModuleType>("IOCrypto");

/**
 * This function deletes the key pair associated with the provided `keyTag`.
 *
 * If there is not any key associated with the provided `keyTag` the promise is
 * successfully resolved.
 *
 * If it is not possible to delete the key pair, the promise is rejected
 * providing an instance of {@link CryptoError}.
 *
 * @param keyTag - The string key tag used to reference the key to delete from
 *   the key store.
 * @returns A promise that resolves when the key is successfully deleted.
 */
export function deleteKey(keyTag: string): Promise<void> {
  return unwrapNativeResult(CryptoModule.deletePublicKey(keyTag));
}

/**
 * This function generates a key pair and returns the public key in its JWK
 * format if succesfull.
 *
 * The key generation provides only keys that can be secured by hardware.
 *
 * - On iOS only Elliptic Curves (NIST P-256) are generated
 * - On Android there is a fallback mechanism where firstly an Elliptic Curve
 *   (NIST P-256) key is tried. If this key generation fails, an RSA 2048 key is
 *   tried.
 *
 * If there is already an associated key for the given `keyTag`, the promise if
 * rejected.
 *
 * If it is not possible to generate the key, the promise is rejected providing
 * an instance of {@link CryptoError}.
 *
 * @param keyTag - The string key tag used to save the key in the key store.
 * @returns A promise that resolves to the JWK representation of the public key.
 */
export function generate(keyTag: string): Promise<PublicKey> {
  return unwrapNativeResult(CryptoModule.generate(keyTag));
}

/**
 * Returns the public key in its JWK format using legacy encoding.
 *
 * - Uses standard Base64 encoding (includes padding and non-URL-safe characters)
 * - May include a leading zero byte in some fields (e.g., x, y, n, e)
 *
 * This method is kept for backward compatibility with older consumers that
 * expect this specific encoding. For a strict, interoperable format (RFC 7515),
 * use {@link getPublicKeyFixed} instead.
 *
 * If the key cannot be retrieved, the promise is rejected with an instance of
 * {@link CryptoError}.
 *
 * @param keyTag - The key tag used to reference the key in secure storage.
 * @returns A promise that resolves to the JWK representation of the public key.
 */
export function getPublicKey(keyTag: string): Promise<PublicKey> {
  return unwrapNativeResult(CryptoModule.getPublicKey(keyTag));
}

/**
 * This function returns the public key in its strict JWK-compliant format if it
 * exists.
 *
 * Compared to {@link getPublicKey}, this version:
 *
 * - Encodes coordinates (`x`, `y`) using Base64URL (RFC 7515), with no padding
 *
 * If it is not possible to retrieve the key, the promise is rejected providing
 * an instance of {@link CryptoError}.
 *
 * @param keyTag - The key tag used to reference the key in secure storage.
 * @returns A promise that resolves to the strict JWK representation of the
 *   public key.
 */
export function getPublicKeyFixed(keyTag: string): Promise<PublicKey> {
  return unwrapNativeResult(CryptoModule.getPublicKeyFixed(keyTag));
}

/**
 * This function checks whether or not a key is backed by Strongbox on Android.
 *
 * If it is not possible to retrive the key, the promise is rejected providing
 * an instance of {@link CryptoError}.
 *
 * @param keyTag - The string key tag used to reference the key in the key
 *   store.
 * @returns A promise that resolves to true if the key is backed by Strongbox,
 *   false otherwise.
 */
export function isKeyStrongboxBacked(keyTag: string): Promise<boolean> {
  return unwrapNativeResult(CryptoModule.isKeyStrongboxBacked(keyTag));
}

/**
 * This function signs the provided `message` with the private key associated
 * with the provided `keyTag`.
 *
 * If it is not possible to sign, the promise is rejected providing an instance
 * of {@link CryptoError}.
 *
 * @param message - The string message to sign.
 * @param keyTag - The string key tag used to reference the key in the key
 *   store.
 * @returns A promise that resolves to the Base64 string representation of the
 *   signature.
 */
export function sign(message: string, keyTag: string): Promise<string> {
  return unwrapNativeResult(CryptoModule.signUTF8Text(message, keyTag));
}

/**
 * Verifies a certificate chain against a trust anchor.
 *
 * @param certChainBase64 - Array of X.509 certificates in Base64 format,
 *   ordered from end-entity to issuer
 * @param trustAnchorBase64 - Trust anchor certificate in Base64 format
 * @param options - Options for certificate validation, including timeouts
 * @returns Promise resolving to validation result with detailed status
 */
export async function verifyCertificateChain(
  certChainBase64: Array<string>,
  trustAnchorBase64: string,
  options: X509CertificateOptions
): Promise<CertificateValidationResult> {
  const { errorMessage, isValid, status } = await unwrapNativeResult(
    CryptoModule.verifyCertificateChain(
      certChainBase64,
      trustAnchorBase64,
      options
    )
  );
  return { errorMessage, isValid, validationStatus: status };
}

function isNativeCryptoFailure(value: unknown): value is NativeCryptoFailure {
  return typeof value === "object" && value !== null && "cryptoError" in value;
}

async function unwrapNativeResult<Value>(
  result: NativeResult<Value>
): Promise<Value> {
  const value = await result;
  if (isNativeCryptoFailure(value)) {
    throw Object.assign(
      new Error(value.cryptoError.message),
      value.cryptoError
    );
  }
  return value;
}
