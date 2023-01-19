import { getError } from "../errors";
import { SignatureConfig } from "./types/SignatureConfig";
import { constants } from "./constants";

/**
 * Extract the header parameter value from config
 *
 * @param {string} headerParameter - The name of the header parameter.
 * @param {SignatureConfig} config - The config.
 * @returns {string} The string value of the header parameter.
 * @throws {Error} if an unknown header parameter is found.
 */
function getHttpSignatureHeaderParameterFromConfig(
  headerParameter: string,
  config: SignatureConfig
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

export type SignatureBaseResult = {
  signatureBase: string;
  signatureInput: string;
};

/**
 * Generates the base string.
 * https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-15.html#name-creating-the-signature-base
 *
 * @param {ReadOnlyRecord<string, string>} headers - The HTTP request headers.
 * @param {SignatureConfig} config - The config.
 * @returns {SignatureBaseResult} signature base and input strings.
 * @throws {Error} if needed data is missing or unknown.
 */
function generateSignatureBase(
  headers: Record<string, string>,
  config: SignatureConfig
): SignatureBaseResult {
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

    /**
     * https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-15.html#name-verifying-a-signature
     *
     * The value of the @signature-params input is the value of the Signature-Input
     * field for this signature serialized according to the rules described in Section 2.3.
     * Note that this does not include the signature's label from the Signature-Input field.
     */
    const signatureInput = generateSignatureInput(headers, config).replace(
      constants.SIGNATURE_PREFIX(),
      ""
    );
    baseString = baseString + signatureInput;

    return { signatureBase: baseString, signatureInput };
  } catch (e) {
    throw new Error(`Error creating signature base: ${getError(e).message}`);
  }
}

/**
 * Generates the 'Signature-Input' header value for provided config and headers.
 * https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-15.html#name-the-signature-input-http-fi
 *
 * @param {Record<string, string>} headers - The HTTP headers.
 * @param {SignatureConfig} config - The input config.
 * @returns {string} - the 'Signature-Input' header value.
 */
function generateSignatureInput(
  headers: Record<string, string>,
  config: SignatureConfig
): string {
  // eslint-disable-next-line functional/no-let
  let signatureInputPayload: string = "";
  config.signatureParams.forEach(param => {
    if (
      param === constants.HEADERS.CONTENT_DIGEST &&
      !headers[constants.HEADERS.CONTENT_DIGEST]
    ) {
      return;
    }

    signatureInputPayload += `"${param}" `;
  });

  return generateSignatureInputValue(signatureInputPayload, config);
}

/**
 * Generates the 'Signature-Input' header value for a string payload.
 *
 * @param {string} payload
 * @param {number} signatureOrdinal
 * @returns the 'Signature-Input' header value.
 */
function generateSignatureInputValue(
  payload: string,
  config: SignatureConfig,
  signatureOrdinal: number = 1
): string {
  const unixTimestamp = getUnixTimestamp();
  return `${constants.SIGNATURE_PREFIX(
    signatureOrdinal
  )}(${payload.trim()});created=${unixTimestamp};alg="${
    config.signAlgorithm
  }";keyid="${config.signKeyId}"`;
}

/**
 * Generates the 'Signature' header value for provided config and headers.
 * https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-15.html#name-http-message-signatures
 *
 * @param {Record<string, string>} headers The HTTP headers.
 * @param {SignatureConfig} config The input config.
 * @returns {string} the signature header value.
 */
function generateSignature(
  headers: Record<string, string>,
  config: SignatureConfig,
  keyTag: string
): string {
  const baseString = generateSignatureBase(headers, config).signatureBase;
  const privateKey = keyTag; // TODO: to be used with io-react-native-crypto

  return generateSignatureValue(baseString, privateKey);
}

/**
 * Generate the 'Signature' header value for a string payload.
 *
 * @param {string} payload - the string payload to sign.
 * @param {string} keyTag - the tag name of the private key to be used to sign the payload.
 * @param {number} signatureOrdinal - the signature ordinal.
 * @returns the signature header value.
 */
function generateSignatureValue(
  payload: string,
  keyTag: string,
  signatureOrdinal: number = 1
): string {
  const signature: string = `TODO: signMessage(${payload}, ${keyTag})`;

  return (
    constants.SIGNATURE_PREFIX(signatureOrdinal) +
    constants.COLON +
    signature +
    constants.COLON
  );
}

/**
 * Returns the current UNIX timestamp.
 *
 * @returns {number} The unix timestamp.
 */
function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export {
  generateSignatureBase,
  getUnixTimestamp,
  generateSignatureInput,
  generateSignature
};
