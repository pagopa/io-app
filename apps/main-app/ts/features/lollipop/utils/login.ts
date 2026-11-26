import { PublicKey } from "@io-app/expo-crypto";
import { getRedirects } from "@io-app/login-utils";
import { err, ok, Result, ResultAsync } from "neverthrow";
import pako from "pako";
import URLParse from "url-parse";
import { parseStringPromise, processors } from "xml2js";

import { handleRegenerateEphemeralKey } from "..";
import { AppDispatch } from "../../../App";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { unknownToString } from "../../../utils/errors";
import { getLoginHeaders } from "../../authentication/common/utils";
import {
  LoginFailure,
  LOLLIPOP_FAILURE_REASONS,
  LollipopFailureReason,
  NATIVE_REDIRECTS_FAILURE_REASONS
} from "../../authentication/common/utils/loginFailure";
import { toBase64EncodedThumbprint } from "./crypto";

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT = "SHA-256";
export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER = "sha256";

/**
 * Decodes the `SAMLRequest`, URL encoded and then base64 encoded and
 * compressed, into the original XML of the server. `undefined` if it cannot be
 * decoded.
 */
const decodeSamlRequest = (
  urlEncodedSamlRequest: string
): string | undefined => {
  try {
    return pako.inflateRaw(
      new Uint8Array(
        Buffer.from(decodeURIComponent(urlEncodedSamlRequest), "base64")
      ),
      { to: "string" }
    );
  } catch {
    return undefined;
  }
};

/**
 * Verifies that the `SAMLRequest` is bound to the given Lollipop public key,
 * i.e. that its `AuthnRequest` ID is the thumbprint of the key.
 *
 * @param urlEncodedSamlRequest The `SAMLRequest` query parameter, URL encoded.
 * @param publicKey The Lollipop public key the request must be bound to.
 * @returns Why the request is not bound to the key, or `undefined` if it is.
 */
export const verifySamlRequest = async (
  urlEncodedSamlRequest: string,
  publicKey: PublicKey
): Promise<LollipopFailureReason | undefined> => {
  const xmlSamlRequest = decodeSamlRequest(urlEncodedSamlRequest);
  if (xmlSamlRequest === undefined) {
    return LOLLIPOP_FAILURE_REASONS.DECODING_FAILED;
  }

  try {
    // Parse the XML into a JS object. We strip XML namespace prefixes (e.g.,
    // 'samlp:' or 'saml2p:') from tag names to reliably access the
    // 'AuthnRequest', regardless of the namespace alias.
    const jsonSamlRequest = await parseStringPromise(xmlSamlRequest, {
      tagNameProcessors: [processors.stripPrefix]
    });
    // The ID parameter (which may not be there) is in the format
    // {HashAlgorithmName}-{HashedPublicKey}
    const remoteThumbprint = jsonSamlRequest.AuthnRequest?.$?.ID;
    if (!remoteThumbprint) {
      return LOLLIPOP_FAILURE_REASONS.MISSING_ID;
    }

    // Hash the local public key and prepend the algorithm used to hash it, in
    // the representation that the server recognizes
    const localThumbprint = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toBase64EncodedThumbprint(publicKey)}`;

    // If they do not match, the response cannot be trusted
    return localThumbprint === remoteThumbprint
      ? undefined
      : LOLLIPOP_FAILURE_REASONS.MISMATCH;
  } catch {
    return LOLLIPOP_FAILURE_REASONS.CONVERSION_FAILED;
  }
};

/** Callback version of `verifySamlRequest`. */
export const lollipopSamlVerify = async (
  urlEncodedSamlRequest: string,
  publicKey: PublicKey,
  onSuccess: () => void,
  onFailure: (reason: LollipopFailureReason) => void
) => {
  const failureReason = await verifySamlRequest(
    urlEncodedSamlRequest,
    publicKey
  );
  if (failureReason) {
    onFailure(failureReason);
    return;
  }
  onSuccess();
};

// TODO: remove together with the IO login flow
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
): Promise<Result<string, LoginFailure>> => {
  const publicKey = await handleRegenerateEphemeralKey(
    keyTag,
    isMixpanelEnabled,
    dispatch
  );

  if (!publicKey) {
    return err({ kind: "keyGeneration", details: {} });
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
 * Follows the native redirects starting from the given URL and returns the last
 * redirect URL.
 *
 * @param url The URL to start following the redirects from.
 * @param headers Headers sent with the first request only.
 * @returns The last redirect URL, or a `nativeRedirects` failure.
 */
const getLastRedirect = async (
  url: string,
  headers: Record<string, string | undefined>
): Promise<Result<string, LoginFailure>> => {
  const redirectsResult = await ResultAsync.fromPromise(
    getRedirects(url, headers, "SAMLRequest"),
    unknownToString
  );

  if (redirectsResult.isErr()) {
    return err({
      kind: "nativeRedirects",
      details: { reason: redirectsResult.error, url }
    });
  }

  const lastRedirect = redirectsResult.value?.at(-1);
  return lastRedirect
    ? ok(lastRedirect)
    : err({
        kind: "nativeRedirects",
        details: {
          reason: NATIVE_REDIRECTS_FAILURE_REASONS.MISSING_REDIRECTS,
          url
        }
      });
};

/**
 * Follows the native redirects starting from the given URL and verifies the
 * SAML request.
 *
 * @param url The URL to start following the redirects from.
 * @param headers Headers sent with the first request only.
 * @param publicKey The lollipop public key the SAML request must be bound to.
 * @returns The verified `SAMLRequest` redirect URL, or a `nativeRedirects` or
 *   `lollipop` failure.
 */
export const followNativeRedirectsAndVerifySaml = async (
  url: string,
  headers: Record<string, string | undefined>,
  publicKey: PublicKey
): Promise<Result<string, LoginFailure>> => {
  const lastRedirectResult = await getLastRedirect(url, headers);

  if (lastRedirectResult.isErr()) {
    return err(lastRedirectResult.error);
  }

  const lastRedirectUrl = lastRedirectResult.value;
  const { SAMLRequest } = new URLParse(lastRedirectUrl, true).query;

  if (!SAMLRequest) {
    return err({
      kind: "nativeRedirects",
      details: {
        reason: NATIVE_REDIRECTS_FAILURE_REASONS.MISSING_SAML_REQUEST,
        url: lastRedirectUrl
      }
    });
  }

  const verificationFailure = await verifySamlRequest(SAMLRequest, publicKey);

  if (verificationFailure) {
    trackLollipopIdpLoginFailure(verificationFailure);
    return err({
      kind: "lollipop",
      details: { reason: verificationFailure, url: lastRedirectUrl }
    });
  }
  return ok(lastRedirectUrl);
};
