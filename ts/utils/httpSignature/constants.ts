const X_PAGOPA_LOLLIPOP_PREFIX = "x-pagopa-lollipop";

export const constants = {
  BASE64: "base64",
  COLON: ":",
  CONTENT_DIGEST_SHA256: "sha-256=:",
  CONTENT_DIGEST_VALIDATION_REGEX: "(.+)=:(.+):",
  HEADERS: {
    APPLICATION_JSON: "application/json",
    CONTENT_DIGEST: "content-digest",
    SIGNATURE_INPUT: "signature-input",
    SIGNATURE: "signature"
  },
  SHA_256: "sha256",
  SIGNATURE_PREFIX: (d: number = 1) => `sig${d}=:`,
  UTF8: "utf8",
  X_PAGOPA_LOLLIPOP_NONCE: `${X_PAGOPA_LOLLIPOP_PREFIX}-nonce`,
  X_PAGOPA_LOLLIPOP_METHOD: `${X_PAGOPA_LOLLIPOP_PREFIX}-method`,
  X_PAGOPA_LOLLIPOP_ORIGINAL_URL: `${X_PAGOPA_LOLLIPOP_PREFIX}-url`,
  X_PAGOPA_LOLLIPOP_ORIGINAL_AUTHORITY: `${X_PAGOPA_LOLLIPOP_PREFIX}-authority`,
  X_PAGOPA_LOLLIPOP_ORIGINAL_QTSP: `${X_PAGOPA_LOLLIPOP_PREFIX}-qtsp`
} as const;
