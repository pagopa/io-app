import { type VerifierRequest } from "@pagopa/io-react-native-proximity";
import {
  ParsedCredential,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { parseClaims } from "../../../common/utils/itwClaimsUtils";
import { ProximityDetails } from "./itwProximityTypeUtils";

export const getProximityDetails = (
  request: VerifierRequest["request"],
  credentialsByType: Record<string, StoredCredential | undefined>
): ProximityDetails =>
  Object.entries(request).map(
    ([credentialType, { isAuthenticated, ...namespaces }]) => {
      const credential = credentialsByType[credentialType];

      // Extract required fields that are part of the verifier request
      const requiredFields = Object.values(namespaces).flatMap(Object.keys);

      // Only include required claims that are part of the parsed credential
      const parsedCredential = requiredFields.reduce<ParsedCredential>(
        (acc, field) => {
          const claim = credential?.parsedCredential[field];
          if (claim !== undefined) {
            return {
              ...acc,
              [field]: claim
            };
          }
          return acc;
        },
        {}
      );

      return {
        credentialType,
        claimsToDisplay: parseClaims(parsedCredential)
      };
    }
  );
