import { getError } from "../errors";
import { Config } from "./types/Config";
import { constants } from "./constants";

/**
 * Extract the header parameter value from config
 *
 * @param {string} headerParameter - The name of the header parameter.
 * @param {Config} config - The config.
 * @returns {string} The string value of the header parameter.
 * @throws {Error} if an unknown header parameter is found.
 */
function getHttpSignatureHeaderParameterFromConfig(
  headerParameter: string,
  config: Config
): string {
  // eslint-disable-next-line functional/no-let
  let returnString = "";
  switch (headerParameter.toLowerCase()) {
    case "@method":
      returnString = config.signatureComponents.method;
      break;
    case "@authority":
      returnString = config.signatureComponents.authority;
      break;
    case "@target-uri":
      returnString = config.signatureComponents.targetUri;
      break;
    case "@path":
      returnString = config.signatureComponents.path;
      break;
    case "@scheme":
      returnString = config.signatureComponents.scheme;
      break;
    case "@request-target":
      returnString = config.signatureComponents.requestTarget;
      break;
    default:
      throw new Error(
        "Unknown http-signature header parameter " + headerParameter
      );
  }
  return returnString;
}

/**
 * Generates the base string.
 *
 * @param {ReadOnlyRecord<string, string>} headers The HTTP request headers.
 * @param {Config} config The config.
 * @returns {string} baseString The base string.
 * @throws {Error} if needed data is missing or unknown.
 */
function generateSignatureBase(
  headers: Record<string, string>,
  config: Config
): string {
  try {
    // eslint-disable-next-line functional/no-let
    let baseString: string = "";
    const signatureParams: Array<string> = config.signatureParams;

    signatureParams.forEach(headerParameter => {
      if (
        headerParameter === constants.HEADERS.CONTENT_DIGEST &&
        !headers[constants.HEADERS.CONTENT_DIGEST]
      ) {
        return;
      }

      baseString += `"${headerParameter.toLowerCase()}": `;

      if (headerParameter.startsWith("@")) {
        baseString += getHttpSignatureHeaderParameterFromConfig(
          headerParameter,
          config
        );
      } else {
        const header = headerParameter;
        if (!headers[header]) {
          throw new Error(
            "Header " + header + " not present in the HTTP request"
          );
        }
        baseString += headers[headerParameter];
      }

      baseString += "\n";
    });

    baseString += '"@signature-params": ';

    // eslint-disable-next-line functional/no-let
    let signatureInput: string = "";
    // eslint-disable-next-line functional/no-let
    let signatureInputBuf: string = "";
    signatureInputBuf += "(";

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < signatureParams.length; i++) {
      const param = signatureParams[i];
      signatureInputBuf += `"${param}"`;
      if (i < signatureParams.length - 1) {
        signatureInputBuf += " ";
      }
    }

    signatureInputBuf += ");created=";
    signatureInputBuf += getUnixTimestamp().toString();
    signatureInput = signatureInputBuf.toString();

    baseString = baseString + signatureInput;

    return baseString;
  } catch (e) {
    throw new Error(`Error creating signature base: ${getError(e).message}`);
  }
}

/**
 * Generates the Signature-Input header value for the input payload.
 *
 * @param {Record<string, string>} headers The HTTP headers.
 * @param {Config} config The input config.
 * @returns {string} the 'Signature-Input' header value.
 */
function generateSignatureInput(
  headers: Record<string, string>,
  config: Config,
  signatureOrdinal: number = 1
): string {
  const unixTimestamp = getUnixTimestamp();
  // eslint-disable-next-line functional/no-let
  let signatureInput: string = `${constants.SIGNATURE_PREFIX(
    signatureOrdinal
  )}(`;

  config.signatureParams.forEach(param => {
    if (
      param === constants.HEADERS.CONTENT_DIGEST &&
      !headers[constants.HEADERS.CONTENT_DIGEST]
    ) {
      return;
    }

    signatureInput += `"${param}" `;
  });

  signatureInput = signatureInput.trim() + `);created=${unixTimestamp}`;

  return signatureInput;
}

/**
 * Returns the current UNIX timestamp.
 *
 * @returns {number} The unix timestamp.
 */
function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export { generateSignatureBase, getUnixTimestamp, generateSignatureInput };
