/**
 * Encodes a given challenge string into the specified encoding format.
 *
 * @param challenge - The input string to be encoded.
 * @param encoding - The encoding format to use: either 'base64' or 'hex'.
 * @returns The encoded string in the specified format.
 */
export function encodeChallenge(
  challenge: string,
  encoding: "base64" | "hex"
): string {
  if (encoding === "base64") {
    // Convert string to UTF-8 bytes, then to base64
    if (typeof btoa === "function") {
      // The btoa function in JavaScript environments expects a "byte string",
      // where each character's code point is in the 0-255 range.
      // A direct call to btoa() on a string containing multi-byte Unicode characters
      // (like '€') will throw an "InvalidCharacterError".
      //
      // This encode/decode chain is a robust trick to solve this:
      // 1. `encodeURIComponent(challenge)`: Converts the string into its UTF-8
      //    percent-encoded representation (e.g., '€' becomes '%E2%82%AC').
      // 2. `decodeURIComponent(...)`: Reinterprets the percent-encoded sequences
      //    back into a string where each character's code point represents a single
      //    byte of the original UTF-8 sequence. This creates a "byte string"
      //    that is safe for btoa to consume.
      return btoa(decodeURIComponent(encodeURIComponent(challenge)));
    }
    // Fallback for environments without btoa
    throw new Error("Base64 encoding not supported in this environment");
  }
  // Hex encoding
  // eslint-disable-next-line functional/no-let
  let hex = "";
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < challenge.length; i++) {
    hex += challenge.charCodeAt(i).toString(16).padStart(2, "0").toUpperCase();
  }
  return hex;
}
