export const constants = {
  BASE64: "base64",
  COLON: ":",
  CONTENT_DIGEST_SHA256: "sha-256=:",
  CONTENT_DIGEST_VALIDATION_REGEX: "(.+)=:(.+):",
  HEADERS: {
    CONTENT_DIGEST: "Content-Digest",
    CONTENT_TYPE: "Content-Type",
    CONTENT_LENGTH: "Content-Length"
  },
  SHA_256: "sha256",
  SIGNATURE_PREFIX: (d: number = 1) => `sig${d}=`,
  UTF8: "utf8",
  X_PAGOPA_LOLLIPOP_METHOD: "x-pagopa-lollipop-original-method",
  X_PAGOPA_LOLLIPOP_ORIGINAL_URL: "x-pagopa-lollipop-original-url"
} as const;
