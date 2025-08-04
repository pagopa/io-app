import { parseClaims } from "../../../common/utils/itwClaimsUtils";
import { assert } from "../../../../../utils/assert";
import { TimeoutError } from "../machine/failure";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { WIA_KEYTAG } from "../../../common/utils/itwCryptoContextUtils";
import type {
  AcceptedFields,
  ProximityDetails,
  RequestedDocument,
  VerifierRequest
} from "./itwProximityTypeUtils";

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

export const getProximityDetails = (
  request: VerifierRequest["request"],
  credentialsByType: Record<string, StoredCredential | undefined>
): ProximityDetails => {
  // Exclude the WIA document type from the request
  const { [WIA_DOC_TYPE]: _, ...otherDocuments } = request;

  return Object.entries(otherDocuments).flatMap(
    ([docType, { isAuthenticated, ...namespaces }]) => {
      const credential = credentialsByType[docType];

      assert(credential, "Credential not found in the wallet");

      // Extract required fields from the verifier request.
      // Each field is formatted as "namespace:field" to match the structure
      // of parsedCredential, which uses colon-separated keys.
      const requiredFields = Object.entries(namespaces).flatMap(
        ([namespace, fields]) =>
          Object.keys(fields).map(field => `${namespace}:${field}`)
      );
      // Only include required claims that are part of the parsed credential.
      const parsedCredential = Object.fromEntries(
        requiredFields
          .filter(field => field in credential.parsedCredential)
          .map(field => [field, credential.parsedCredential[field]])
      );

      return [
        {
          credentialType: credential.credentialType,
          claimsToDisplay: parseClaims(parsedCredential)
        }
      ];
    }
  );
};

export const getDocuments = (
  request: VerifierRequest["request"],
  credentialsByType: Record<string, StoredCredential | undefined>,
  wiaMdoc: string
): Array<RequestedDocument> => {
  // Exclude the WIA document type from the request
  const { [WIA_DOC_TYPE]: _, ...rest } = request;

  const documents = Object.entries(rest).map(([docType]) => {
    const storedCredential = credentialsByType[docType];

    // This should be guaranteed by getProximityDetails having already validated credentials
    assert(storedCredential, "Credential not found in the wallet");

    const { credential, keyTag } = storedCredential;

    return {
      alias: keyTag,
      docType,
      issuerSignedContent: credential
    };
  });

  return [
    ...documents,
    {
      alias: WIA_KEYTAG,
      docType: WIA_DOC_TYPE,
      issuerSignedContent: wiaMdoc
    }
  ];
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
