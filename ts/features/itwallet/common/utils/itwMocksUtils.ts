import dc from "../../__mocks__/dc.json";
import eid from "../../__mocks__/eid.json";
import mdl from "../../__mocks__/mdl.json";
import mdlL3 from "../../__mocks__/L3/mdlL3.json";
import tsL3 from "../../__mocks__/L3/tsL3.json";
import dcL3 from "../../__mocks__/L3/dcL3.json";
import edL3 from "../../__mocks__/L3/edL3.json";
import eeL3 from "../../__mocks__/L3/eeL3.json";
import resL3 from "../../__mocks__/L3/resL3.json";
import statusAssertion from "../../__mocks__/statusAssertion.json";
import ts from "../../__mocks__/ts.json";
import { ParsedStatusAssertion, StoredCredential } from "./itwTypesUtils";

export const ISSUER_MOCK_NAME = "Istituto Poligrafico e Zecca dello Stato";

export type CredentialL3Key = keyof typeof ItwStoredCredentialsMocks.L3;

/**
 * Credential types mocks.
 */
export enum CredentialType {
  EUROPEAN_HEALTH_INSURANCE_CARD = "EuropeanHealthInsuranceCard",
  EUROPEAN_DISABILITY_CARD = "EuropeanDisabilityCard",
  DRIVING_LICENSE = "mDL",
  PID = "PersonIdentificationData",
  EDUCATION_DEGREE = "education_degree",
  EDUCATION_ENROLLMENT = "education_enrollment",
  RESIDENCY = "residency"
}

export const ItwStoredCredentialsMocks = {
  eid: eid as unknown as StoredCredential,
  dc: dc as unknown as StoredCredential,
  mdl: mdl as unknown as StoredCredential,
  ts: ts as unknown as StoredCredential,
  L3: {
    mdl: mdlL3 as unknown as StoredCredential,
    ts: tsL3 as unknown as StoredCredential,
    dc: dcL3 as unknown as StoredCredential,
    ed: edL3 as unknown as StoredCredential,
    ee: eeL3 as unknown as StoredCredential,
    res: resL3 as unknown as StoredCredential
  }
};

export const ItwStatusAssertionMocks = {
  mdl: statusAssertion as ParsedStatusAssertion
};
