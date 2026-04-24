import { CredentialType } from "../../../utils/itwMocksUtils";
import { getCredentialCardConfig } from "../config.ts";

describe("credential card config", () => {
  test.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EDUCATION_ATTENDANCE,
    CredentialType.EDUCATION_DEGREE,
    CredentialType.EDUCATION_DIPLOMA,
    CredentialType.EDUCATION_ENROLLMENT,
    CredentialType.RESIDENCY
  ])("should match snapshot for type [%s]", type => {
    expect(getCredentialCardConfig(type)).toMatchSnapshot();
  });
});
