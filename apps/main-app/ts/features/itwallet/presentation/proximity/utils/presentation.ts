import type {
  AcceptedFields,
  ProximityDetails,
  RequestedDocument,
  VerifierRequest
} from "./types";

import { assert } from "../../../../../utils/assert";
import {
  parseClaims,
  WellKnownClaim
} from "../../../common/utils/itwClaimsUtils";
import { getRepresentativeVaultId } from "../../../common/utils/itwCredentialUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import {
  MissingCredentialError,
  TimeoutError,
  UntrustedRpError
} from "./errors";

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
  credentials: Partial<Record<string, CredentialMetadata>>;
  request: VerifierRequest["request"];
  requireAuthenticated?: boolean;
}) => ProximityDetails;

/**
 * Get the relying party identifier from the Verifier request, which is used to
 * identify the RP in the presentation details.
 *
 * If `requireAuthenticated` is `true`, the function will throw an error if the
 * request does not contain authenticated certificate data.
 * Otherwise, we tentatively get verifier's commonName from the certificate data
 * if available, but we allow the flow to proceed even if it's not present.
 * This can be useful for testing purposes, and should not be used in production.
 *
 * @param certificateData The certificate data from the Verifier request
 * @param requireAuthenticated Whether to require the RP to be authenticated
 *
 * @throws UntrustedRpError if the certificate data does not contain verifier's
 * commonName and `requireAuthenticated` is `true`
 */
export const getVerifierIdentity = (
  certificateData: VerifierRequest["request"][string]["certificateData"],
  requireAuthenticated?: boolean
): string => {
  if (!requireAuthenticated) {
    return certificateData?.commonName || "Unknown";
  }

  // Get the common name from the certificate data as relying party identifier
  if (!certificateData?.commonName) {
    throw new UntrustedRpError(
      "Missing certificate data for RP identification"
    );
  }

  return certificateData.commonName;
};

/**
 * Returns the best available user-facing name for the relying party without
 * changing the stable identifier used for consent lookup.
 */
export const getVerifierDisplayName = (
  certificateData: VerifierRequest["request"][string]["certificateData"]
): string | undefined =>
  certificateData?.organization || certificateData?.commonName;

/**
 * Get the Presentation details based on the request from the Verifier.
 *
 * @param request The request from the Verifier, specifying which document types and claims are required
 * @param credentialsByType The credentials object by doc type
 * @param requireAuthenticated Whether to require the RP to be authenticated,
 * default is true. If set to false, unauthenticated RPs will be allowed,
 * which can be useful for testing purposes, but should be used with caution in
 * production.
 *
 * @returns Presentation details for requested credentials available in the wallet
 * @throws MissingCredentialError when none of the requested credentials are available
 */
export const getProximityDetails: GetProximityDetails = ({
  request,
  credentials: credentialsByType,
  requireAuthenticated = true
}) => {
  // Exclude the WIA document type from the request
  const { [WIA_DOC_TYPE]: _, ...rest } = request;
  assert(
    Object.keys(rest).length > 0,
    "No requested documents found in the Verifier request"
  );

  const proximityDetails = Object.entries(rest).map(
    ([docType, { isAuthenticated, certificateData, ...namespaces }]) => {
      // Stop the flow if the verifier (RP) is not trusted
      if (!isAuthenticated && requireAuthenticated) {
        throw new UntrustedRpError("Untrusted RP");
      }

      const credential = credentialsByType[docType];
      if (!credential) {
        return undefined;
      }

      const rpId = getVerifierIdentity(certificateData, requireAuthenticated);
      const rpDisplayName = getVerifierDisplayName(certificateData);

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
        rpId,
        rpDisplayName,
        credentialType: credential.credentialType,
        claimsToDisplay: parseClaims(parsedCredential, {
          exclude: [WellKnownClaim.unique_id]
        })
      };
    }
  );

  const missingCredentials = Object.keys(rest).filter(
    docType => !credentialsByType[docType]
  );
  if (missingCredentials.length === Object.keys(rest).length) {
    throw new MissingCredentialError(missingCredentials);
  }

  return proximityDetails.filter(
    details => details !== undefined
  ) as ProximityDetails;
};

/**
 * Get the requested documents based on the request from the Verifier.
 *
 * @param request The request from the Verifier, specifying which document types and claims are required
 * @param credentials The credentials object by doc type
 * @param getCredential Retrieves signed credential content from the secure store
 * @returns The requested documents available in the wallet
 */
export const getDocuments = async (
  request: VerifierRequest["request"],
  credentials: Partial<Record<string, CredentialMetadata>>,
  getCredential: (vaultId: string) => Promise<string | undefined>
): Promise<Array<RequestedDocument>> => {
  const availableDocuments = Object.keys(request).flatMap(docType => {
    const credential = credentials[docType];
    return credential ? [{ credential, docType }] : [];
  });

  const documents = await Promise.all(
    availableDocuments.map(async ({ credential, docType }) => {
      // Present the representative copy (the only one for a non-batch credential).
      const vaultId = getRepresentativeVaultId(credential);
      const signedContent = await getCredential(vaultId);
      assert(
        signedContent,
        `Credential not found in secure store for vaultId: ${vaultId}`
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

/**
 * Marks every requested field as accepted, optionally limiting the result to
 * document types included in the generated response.
 */
export const generateAcceptedFields = (
  request: VerifierRequest["request"],
  includedDocTypes?: ReadonlySet<string>
): AcceptedFields =>
  Object.entries(request)
    .filter(([docType]) => !includedDocTypes || includedDocTypes.has(docType))
    .reduce(
      (
        acc,
        [docType, { isAuthenticated, certificateData, ...namespaces }]
      ) => ({
        ...acc,
        [docType]: acceptAllFields(namespaces)
      }),
      {}
    );
