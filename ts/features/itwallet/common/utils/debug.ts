/**
 * Debug utilities
 */

import { ParsedCredential } from "./itwTypesUtils";

/**
 * Removes very long claims (like Base64 images) from the parsed credential. Usefull to print for debug purposes
 */
export const getHumanReadableParsedCredential = (
  parsedCredential: ParsedCredential
): ParsedCredential =>
  Object.fromEntries(
    Object.entries(parsedCredential).map(([key, { name, value }]) => [
      key,
      {
        name,
        value:
          typeof value === "string" && value.length > 100
            ? `${value.slice(0, 100)}...`
            : value
      }
    ])
  );
