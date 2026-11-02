import { PublicKey } from "@pagopa/io-react-native-crypto";
import {
  getRedirects,
  isLoginUtilsError
} from "@pagopa/io-react-native-login-utils";
import { err, ok, Result, ResultAsync } from "neverthrow";
import pako from "pako";
import URLParse from "url-parse";
import { parseStringPromise, processors } from "xml2js";

import { handleRegenerateEphemeralKey } from "..";
import { AppDispatch } from "../../../App";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { unknownToString } from "../../../utils/errors";
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

type RedirectsResult = Result<string, { reason: string; url?: string }>;

/**
 * Generates a new ephemeral key, then follows the native redirects and verifies
 * the SAML request bound to it.
 */
export const regenerateKeyGetRedirectsAndVerifySaml = async (
  loginUri: string,
  keyTag: string,
  isMixpanelEnabled: boolean | null,
  isFastLogin: boolean,
  dispatch: AppDispatch,
  idpId?: string,
  hashedFiscalCode?: string
): Promise<RedirectsResult> => {
  const publicKey = await handleRegenerateEphemeralKey(
    keyTag,
    isMixpanelEnabled,
    dispatch
  );

  if (!publicKey) {
    return err({ reason: "Missing publicKey" });
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
 * Builds a failure reason for the native redirects flow, including the native
 * error details when available.
 *
 * @param error The error object to extract the failure message from.
 * @returns A string describing the failure reason.
 */
const getNativeRedirectsFailure = (error: unknown): string => {
  if (isLoginUtilsError(error)) {
    return `${error.code} ${unknownToString(error.userInfo)}`;
  }
  return unknownToString(error);
};

/**
 * Follows the native redirects starting from the given URL and returns the last
 * redirect URL.
 *
 * @param url The URL to start following the redirects from.
 * @param headers Headers sent with the first request only.
 * @returns The last redirect URL wrapped in a `Result` object.
 */
export const getLastRedirect = async (
  url: string,
  headers: Record<string, string | undefined>
) => {
  const redirectsResult = await ResultAsync.fromPromise(
    getRedirects(url, headers, "SAMLRequest"),
    getNativeRedirectsFailure
  );

  if (redirectsResult.isErr()) {
    return err(redirectsResult.error);
  }

  const lastRedirect = redirectsResult.value?.at(-1);
  return lastRedirect ? ok(lastRedirect) : err("Missing Redirects");
};

/**
 * Follows the native redirects starting from the given URL and verifies the
 * SAML request.
 *
 * @param url The URL to start following the redirects from.
 * @param headers Headers sent with the first request only.
 * @param publicKey The lollipop public key the SAML request must be bound to.
 * @returns The verified `SAMLRequest` redirect URL wrapped in a `Result`
 *   object.
 */
export const followNativeRedirectsAndVerifySaml = async (
  url: string,
  headers: Record<string, string | undefined>,
  publicKey: PublicKey
): Promise<RedirectsResult> => {
  const lastRedirectResult = await getLastRedirect(url, headers);

  if (lastRedirectResult.isErr()) {
    return err({ reason: lastRedirectResult.error });
  }

  const lastRedirectUrl = lastRedirectResult.value;
  const { SAMLRequest } = new URLParse(lastRedirectUrl, true).query;

  if (!SAMLRequest) {
    return err({
      reason: "Missing SAMLRequest parameter in URL",
      url: lastRedirectUrl
    });
  }

  const verifiedResult = await ResultAsync.fromPromise(
    verifyLollipopSamlRequestTask(lastRedirectUrl, SAMLRequest, publicKey),
    error => (error instanceof Error ? error.message : unknownToString(error))
  );

  if (verifiedResult.isErr()) {
    return err({ reason: verifiedResult.error });
  }
  return ok(lastRedirectUrl);
};
