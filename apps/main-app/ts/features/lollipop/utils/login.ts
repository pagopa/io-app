import { getRedirects } from "@io-app/login-utils";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import pako from "pako";
import URLParse from "url-parse";
import { parseStringPromise, processors } from "xml2js";

import { handleRegenerateEphemeralKey } from "..";
import { AppDispatch } from "../../../App";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { getLoginHeaders } from "../../authentication/common/utils";
import { toBase64EncodedThumbprint } from "./crypto";

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT = "SHA-256";
export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER = "sha256";

export const lollipopSamlVerify = (
  urlEncodedSamlRequest: string,
  publicKey: PublicKey,
  onSuccess: () => void,
  onFailure: (reason: string) => void
) => {
  // SAMLRequest is URL encoded, so decode it
  try {
    const decodedSamlRequest = decodeURIComponent(urlEncodedSamlRequest);
    // Result is a base64 encoded string, so decode it to obtain the (server) original XML
    const xmlSamlRequest = pako.inflateRaw(
      new Uint8Array(Buffer.from(decodedSamlRequest, "base64")),
      {
        to: "string"
      }
    );

    // Convert XML to JSON (in order not to include an XML Parser library).
    // We strip XML namespace prefixes (e.g., 'samlp:' or 'saml2p:') from tag names
    // to reliably access the 'AuthnRequest', regardless of the namespace alias.
    parseStringPromise(xmlSamlRequest, {
      tagNameProcessors: [processors.stripPrefix]
    })
      .then(jsonSamlRequest => {
        // Extract the AuthnRequest from the JSON
        const authnRequest = jsonSamlRequest.AuthnRequest;
        // Extract the ID parameter (which may not be there, so handle the case).
        // The extracted string is in the format {HashAlgorithmName}-{HashedPublicKey}
        const responseThumbprintWithHashAlgorithm = authnRequest?.$?.ID;
        if (!responseThumbprintWithHashAlgorithm) {
          // If the request did not include the ID, treat it as a failure
          onFailure("Missing ID parameter in AuthnRequest");
          return;
        }

        // Hash the local public key
        const localPublicKeyThumbprint = toBase64EncodedThumbprint(publicKey);
        // And append the algorithm used to hash it. The algorithm
        // representation must be the one that the server recognizes
        const localPublicKeyThumbprintWithHashAlgorithm = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${localPublicKeyThumbprint}`;

        if (
          localPublicKeyThumbprintWithHashAlgorithm !==
          responseThumbprintWithHashAlgorithm
        ) {
          // Hash signature from server did not match the
          // local one, so the response cannot be trusted
          onFailure("Mismatch between local and remote ID parameter content");
          return;
        }

        onSuccess();
      })
      .catch(_ => {
        onFailure("Unable to convert saml request from xml to json");
      });
  } catch {
    onFailure("Unable to decode saml request");
  }
};

export const verifyLollipopSamlRequestTask = (
  url: string,
  urlEncodedSamlRequest: string,
  publicKey: PublicKey
): Promise<string> =>
  new Promise((resolve, reject) => {
    lollipopSamlVerify(
      urlEncodedSamlRequest,
      publicKey,
      () => {
        resolve(url);
      },
      (reason: string) => {
        trackLollipopIdpLoginFailure(reason);
        reject(new Error(reason));
      }
    );
  });

export const regenerateKeyGetRedirectsAndVerifySaml = async (
  loginUri: string,
  keyTag: string,
  isMixpanelEnabled: boolean | null,
  isFastLogin: boolean,
  dispatch: AppDispatch,
  idpId?: string,
  hashedFiscalCode?: string
): Promise<string> => {
  const publicKey = await handleRegenerateEphemeralKey(
    keyTag,
    isMixpanelEnabled,
    dispatch
  );

  if (!publicKey) {
    throw new Error("Missing publicKey");
  }

  const headers = getLoginHeaders(
    publicKey,
    DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
    isFastLogin,
    idpId,
    hashedFiscalCode
  );

  return followNativeRedirectsAndVerifySaml(loginUri, headers, publicKey);
};

/**
 * Natively follows the HTTP redirects starting from `url` until the one
 * carrying the `SAMLRequest` query parameter, then verifies that the SAML
 * request ID matches the thumbprint of `publicKey`. Cookies set along the
 * redirects are synced into the WebView cookie store by the native module.
 *
 * @param url The URL to start following the redirects from.
 * @param headers Headers sent with the first request only.
 * @param publicKey The lollipop public key the SAML request must be bound to.
 * @returns The verified `SAMLRequest` redirect URL (the IdP SSO URL).
 * @throws {LoginUtilsError | Error} If the redirects fail, the `SAMLRequest` is
 *   missing or its verification fails.
 */
export const followNativeRedirectsAndVerifySaml = async (
  url: string,
  headers: Record<string, string | undefined>,
  publicKey: PublicKey
): Promise<string> => {
  // getRedirects throws LoginUtilsError or generic Error — let them propagate as-is
  const redirects = await getRedirects(url, headers, "SAMLRequest");

  const lastRedirect = redirects?.at(-1);
  if (!lastRedirect) {
    throw new Error("Missing Redirects");
  }
  const urlEncodedSamlRequest = new URLParse(lastRedirect, true).query
    .SAMLRequest;
  if (!urlEncodedSamlRequest) {
    throw new Error("Missing SAMLRequest");
  }

  return verifyLollipopSamlRequestTask(
    lastRedirect,
    urlEncodedSamlRequest,
    publicKey
  );
};
