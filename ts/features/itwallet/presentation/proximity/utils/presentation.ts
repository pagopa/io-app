import { assert } from "../../../../../utils/assert";
import {
  parseClaims,
  WellKnownClaim
} from "../../../common/utils/itwClaimsUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { TimeoutError, UntrustedRpError } from "./errors";
import type {
  AcceptedFields,
  ProximityDetails,
  RequestedDocument,
  VerifierRequest
} from "./types";

const WIA_DOC_TYPE = "org.iso.18013.5.1.IT.WalletAttestation";

export const promiseWithTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number
) => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError("Request timed out"));
    }, timeoutMs);
  });

  return Promise.race<T>([promise, timeout]);
};

type GetProximityDetails = (params: {
  request: VerifierRequest["request"];
  credentials: Record<string, CredentialMetadata>;
  requireAuthenticated?: boolean;
}) => ProximityDetails;

/**
 * Get the Presentation details based on the request from the Verifier.
 *
 * @param request The request from the Verifier, specifying which document types
 *   and claims are required
 * @param credentialsByType The credentials object by doc type
 * @param requireAuthenticated Whether to require the RP to be authenticated,
 *   default is true. If set to false, unauthenticated RPs will be allowed,
 *   which can be useful for testing purposes, but should be used with caution
 *   in production.
 * @returns The Presentation details
 */
export const getProximityDetails: GetProximityDetails = ({
  request,
  credentials: credentialsByType,
  requireAuthenticated = true
}) => {
  // Exclude the WIA document type from the request
  const { [WIA_DOC_TYPE]: _, ...rest } = request;

  return Object.entries(rest).map(
    ([docType, { isAuthenticated, ...namespaces }]) => {
      // Stop the flow if the verifier (RP) is not trusted
      if (!isAuthenticated && requireAuthenticated) {
        throw new UntrustedRpError("Untrusted RP");
      }

      const credential = credentialsByType[docType];

      assert(credential, `Credential not found for docType: ${docType}`);
      // Extract required fields from the verifier request.
      // Each field is formatted as "namespace:field" to match the structure
      // of parsedCredential, which uses colon-separated keys.
      const requiredFields = Object.entries(namespaces).flatMap(
        ([namespace, fields]) =>
          Object.keys(fields).map(field => `${namespace}:${field}`)
      );
      const required = new Set(requiredFields);

      const parsedCredential = Object.fromEntries(
        Object.keys(credential.parsedCredential)
          .filter(k => required.has(k))
          .map(k => [k, credential.parsedCredential[k]])
      );

      return {
        credentialType: credential.credentialType,
        claimsToDisplay: parseClaims(parsedCredential, {
          exclude: [WellKnownClaim.unique_id]
        })
      };
    }
  );
};

/**
 * Get the requested documents based on the request from the Verifier.
 *
 * @param request The request from the Verifier, specifying which document types
 *   and claims are required
 * @param credentialsByType The credentials object by doc type
 * @param wiaMdoc The WIA in mdoc format
 * @returns The requested documents
 */
export const getDocuments = async (
  request: VerifierRequest["request"],
  credentials: Record<string, CredentialMetadata>,
  getCredential: (credentialId: string) => Promise<string | undefined>
): Promise<Array<RequestedDocument>> => {
  const documents = await Promise.all(
    Object.entries(request).map(async ([docType]) => {
      const credential = credentials[docType];
      // This should be guaranteed by getProximityDetails having already validated credentials
      assert(credential, `Credential not found for docType: ${docType}`);

      const signedContent = await getCredential(credential.credentialId);
      assert(
        signedContent,
        `Credential not found in secure store for id: ${credential.credentialId}`
      );

      return {
        alias: credential.keyTag,
        docType,
        issuerSignedContent: signedContent
      };
    })
  );

  return documents;
};

interface NestedBooleanMap {
  [key: string]: boolean | NestedBooleanMap;
}

const acceptAllFields = <T extends NestedBooleanMap>(input: T): T =>
  Object.entries(input).reduce((acc, [key, value]) => {
    if (typeof value === "boolean") {
      return { ...acc, [key]: true };
    } else if (typeof value === "object" && value !== null) {
      return { ...acc, [key]: acceptAllFields(value) };
    } else {
      return { ...acc, [key]: value };
    }
  }, {} as T);

export const generateAcceptedFields = (
  request: VerifierRequest["request"]
): AcceptedFields =>
  Object.entries(request).reduce(
    (acc, [docType, { isAuthenticated, ...namespaces }]) => ({
      ...acc,
      [docType]: acceptAllFields(namespaces)
    }),
    {}
  );
