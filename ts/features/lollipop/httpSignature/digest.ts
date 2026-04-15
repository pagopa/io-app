import sha from "sha.js";
import { constants } from "./constants";

/**
 * Generates the 'Content-Digest' header value for the HTTP request body.
 *
 * @param {string} body - The request body payload.
 * @returns {string} contentDigest The 'Content-Digest' header value.
 */
function generateDigestHeader(body: string): string {
  // eslint-disable-next-line functional/no-let
  let contentDigest: string = "";

  // Validate the input payload
  if (!body) {
    return contentDigest;
  }

  // Calculate the SHA-256 digest
  const hash = sha(constants.SHA_256).update(body).digest(constants.BASE64);

  const algo: string = constants.CONTENT_DIGEST_SHA256;

  contentDigest = algo + hash + constants.COLON;
  return contentDigest;
}

/**
 * Validates the 'Content-Digest' header value.
 *
 * @param {string} contentDigestHeader - The Content-Digest header value.
 * @param {string} body - The HTTP request body.
 * @throws {Error} If the Content-Digest header value is invalid.
 */
function validateDigestHeader(contentDigestHeader: string, body: string): void {
  if (!contentDigestHeader) {
    throw new Error("Content-Digest header missing");
  }

  // Validate
  const contentDigestPattern = new RegExp(
    constants.CONTENT_DIGEST_VALIDATION_REGEX
  );
  const contentDigestParts = contentDigestPattern.exec(contentDigestHeader);
  if (!contentDigestParts || contentDigestParts.length === 0) {
    throw new Error("Content-digest header invalid");
  }
  const cipher: string = contentDigestParts[1];

  if (cipher !== "sha-256") {
    throw new Error("Invalid cipher " + cipher);
  }

  const newDigest: string = generateDigestHeader(body);

  if (newDigest !== contentDigestHeader) {
    throw new Error(
      "Content-Digest value is invalid. Expected body digest is: " + newDigest
    );
  }
}

export { generateDigestHeader, validateDigestHeader };
