import {
  AcceptedFields,
  Proximity,
  type VerifierRequest
} from "@pagopa/io-react-native-proximity";
import { ParsedCredential } from "../../../common/utils/itwTypesUtils";
import { parseClaims } from "../../../common/utils/itwClaimsUtils";
import { assert } from "../../../../../utils/assert";
import { WIA_KEYTAG } from "../../../common/utils/itwCryptoContextUtils";
import { TimeoutError, UntrustedRpError } from "./itwProximityErrors";
import {
  ProximityCredentials,
  ProximityDetails
} from "./itwProximityTypeUtils";

export const WIA_TYPE = "org.iso.18013.5.1.IT.WalletAttestation";

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
  credentialsByType: ProximityCredentials
): ProximityDetails =>
  Object.entries(request).reduce<ProximityDetails>(
    (acc, [credentialType, { isAuthenticated, ...namespaces }]) => {
      // Stop the flow if the verifier (RP) is not trusted
      if (!isAuthenticated) {
        throw new UntrustedRpError("Untrusted RP");
      }

      const credential = credentialsByType[credentialType];

      assert(credential, "Credential not found in the wallet");

      // If the credential is a string, it means it's a WIA
      // and we should not include it in the proximity details
      if (typeof credential === "string") {
        return acc;
      }

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

      return [
        ...acc,
        {
          credentialType,
          claimsToDisplay: parseClaims(parsedCredential)
        }
      ];
    },
    []
  );

export const getDocuments = (
  request: VerifierRequest["request"],
  credentialsByType: ProximityCredentials
): Array<Proximity.Document> =>
  Object.entries(request).reduce<Array<Proximity.Document>>(
    (acc, [credentialKey]) => {
      const storedCredential = credentialsByType[credentialKey];

      // This should be guaranteed by getProximityDetails having already validated credentials
      assert(storedCredential, "Credential not found in the wallet");

      // If the credential is a string, it means it's a WIA
      if (typeof storedCredential === "string") {
        return [
          ...acc,
          {
            alias: WIA_KEYTAG,
            docType: WIA_TYPE,
            issuerSignedContent: storedCredential
          }
        ];
      }

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
