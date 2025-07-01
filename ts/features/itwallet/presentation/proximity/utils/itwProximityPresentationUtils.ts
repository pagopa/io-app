import {
  AcceptedFields,
  Proximity,
  type VerifierRequest
} from "@pagopa/io-react-native-proximity";
import {
  ParsedCredential,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { parseClaims } from "../../../common/utils/itwClaimsUtils";
import { assert } from "../../../../../utils/assert";
import { TimeoutError } from "../machine/failure";
import { ProximityDetails } from "./itwProximityTypeUtils";

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
): ProximityDetails =>
  Object.entries(request).map(
    ([credentialType, { isAuthenticated, ...namespaces }]) => {
      const credential = credentialsByType[credentialType];

      assert(credential, "Credential not found in the wallet");

      // Extract required fields that are part of the verifier request
      const requiredFields = Object.values(namespaces).flatMap(Object.keys);

      // Only include required claims that are part of the parsed credential
      const parsedCredential = requiredFields.reduce<ParsedCredential>(
        (acc, field) => {
          const claim = credential.parsedCredential[field];

          // Ignore required fields that are missing from the parsed credential
          if (!claim) {
            return acc;
          }

          return {
            ...acc,
            [field]: claim
          };
        },
        {}
      );

      return {
        credentialType,
        claimsToDisplay: parseClaims(parsedCredential)
      };
    }
  );

export const getDocuments = (
  request: VerifierRequest["request"],
  credentialsByType: Record<string, StoredCredential | undefined>
): Array<Proximity.Document> =>
  Object.entries(request).reduce<Array<Proximity.Document>>(
    (acc, [credentialKey]) => {
      const storedCredential = credentialsByType[credentialKey];

      // This should be guaranteed by getProximityDetails having already validated credentials
      assert(storedCredential, "Credential not found in the wallet");

      const { credential, credentialType, keyTag } = storedCredential;

      return [
        ...acc,
        {
          alias: keyTag,
          docType: credentialType,
          issuerSignedContent: credential
        }
      ];
    },
    []
  );

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
    (acc, [credentialKey, { isAuthenticated, ...namespaces }]) => ({
      ...acc,
      [credentialKey]: acceptAllFields(namespaces)
    }),
    {}
  );
