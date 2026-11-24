/** Represents the status of certificate validation */
export enum CertificateValidationStatus {
  CRL_EXPIRED = "CRL_EXPIRED", // CRL used is expired
  CRL_FETCH_FAILED = "CRL_FETCH_FAILED", // Failed to download/access/validate a CRL (when CDPs were present)
  CRL_PARSE_FAILED = "CRL_PARSE_FAILED", // Failed to parse CRL content
  CRL_REQUIRED_BUT_MISSING_CDP = "CRL_REQUIRED_BUT_MISSING_CDP", // CRLs required but no CDP present
  CRL_SIGNATURE_INVALID = "CRL_SIGNATURE_INVALID", // Signature on CRL is invalid
  EXPIRED = "CERTIFICATE_EXPIRED", // A certificate in the chain has expired
  INVALID_CHAIN_PATH = "INVALID_CHAIN_PATH", // Basic chain path validation failed (e.g., signature, structure)
  INVALID_TRUST_ANCHOR = "INVALID_TRUST_ANCHOR", // Provided trust anchor is invalid or does not match the chain
  NOT_YET_VALID = "CERTIFICATE_NOT_YET_VALID", // A certificate in the chain is not yet valid
  REVOKED = "CERTIFICATE_REVOKED", // Certificate explicitly marked as revoked in CRL
  VALID = "VALID",
  VALIDATION_ERROR = "VALIDATION_ERROR" // General/unexpected error during validation
}

/** Represents the result of certificate validation */
export interface CertificateValidationResult {
  /** Error message in case validation failed */
  errorMessage: string;
  /** Whether the certificate chain is valid */
  isValid: boolean;
  /** The specific validation status */
  validationStatus: CertificateValidationStatus;
}

/**
 * Error type returned by a rejected promise.
 *
 * If additional error information are available, they are stored in the
 * {@link CryptoError["userInfo"]} field.
 */
export type CryptoError = {
  message: CryptoErrorCodes;
  userInfo: Record<string, string>;
};

/** All error codes that the module could return. */
export type CryptoErrorCodes = CryptoErrorCodesAndroid | CryptoErrorCodesIOS;

/** This is the JWK JSON type for the EC keys. */
export type ECKey = {
  crv: string;
  kty: "EC";
  x: string;
  y: string;
};

/** The Public Key type. It could be either an ECKey or an RSAKey. */
export type PublicKey = ECKey | RSAKey;

/** This is the JWK JSON type for the RSA keys. */
export type RSAKey = {
  alg: string;
  e: string;
  kty: "RSA";
  n: string;
};

/** Options for X.509 certificate validation */
export interface X509CertificateOptions {
  connectTimeout: number;
  readTimeout: number;
  requireCrl: boolean;
}

/** Error codes returned by the Android side. */
type CryptoErrorCodesAndroid =
  | "API_LEVEL_NOT_SUPPORTED"
  | "CERTIFICATE_CHAIN_VALIDATION_ERROR"
  | "INVALID_SIGN_ALGORITHM"
  | "INVALID_UTF8_ENCODING"
  | "KEY_ALREADY_EXISTS"
  | "KEYSTORE_LOAD_FAILED"
  | "PUBLIC_KEY_DELETION_ERROR"
  | "PUBLIC_KEY_NOT_FOUND"
  | "UNABLE_TO_SIGN"
  | "UNKNOWN_EXCEPTION"
  | "UNSUPPORTED_DEVICE"
  | "WRONG_KEY_CONFIGURATION";

/** Error codes returned by the iOS module. */
type CryptoErrorCodesIOS =
  | "CERTIFICATE_CHAIN_VALIDATION_ERROR"
  | "INVALID_UTF8_ENCODING"
  | "KEY_ALREADY_EXISTS"
  | "KEYCHAIN_LOAD_FAILED"
  | "PUBLIC_KEY_DELETION_ERROR"
  | "PUBLIC_KEY_NOT_FOUND"
  | "THREADING_ERROR"
  | "UNABLE_TO_SIGN"
  | "UNSUPPORTED_DEVICE"
  | "WRONG_KEY_CONFIGURATION";
