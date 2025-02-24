import dc from "../../__mocks__/dc.json";
import eid from "../../__mocks__/eid.json";
import mdl from "../../__mocks__/mdl.json";
import statusAttestation from "../../__mocks__/statusAttestation.json";
import ts from "../../__mocks__/ts.json";
import presentationClaims from "../../__mocks__/presentationClaims.json";
import { RequiredClaim } from "../../issuance/components/ItwRequestedClaimsList";
import { ParsedStatusAttestation, StoredCredential } from "./itwTypesUtils";

export const ISSUER_MOCK_NAME = "Istituto Poligrafico e Zecca dello Stato";

/**
 * Credential types mocks.
 */
export enum CredentialType {
  EUROPEAN_HEALTH_INSURANCE_CARD = "EuropeanHealthInsuranceCard",
  EUROPEAN_DISABILITY_CARD = "EuropeanDisabilityCard",
  DRIVING_LICENSE = "MDL",
  PID = "PersonIdentificationData"
}

export const ItwStoredCredentialsMocks = {
  eid: eid as unknown as StoredCredential,
  dc: dc as unknown as StoredCredential,
  mdl: mdl as unknown as StoredCredential,
  ts: ts as unknown as StoredCredential
};

export const ItwStatusAttestationMocks = {
  mdl: statusAttestation as ParsedStatusAttestation
};

export const ItwRemotePresentationClaimsMock = {
  required: presentationClaims.requiredClaims as Array<RequiredClaim>,
  optional: presentationClaims.optionalClaims as Array<RequiredClaim>
};
