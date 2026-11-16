import { CredentialType } from "../itwMocksUtils";
import { getLegacyThemeColorByCredentialType } from "../itwStyleUtils";

describe("getLegacyThemeColorByCredentialType", () => {
  it.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EDUCATION_DEGREE
  ])("should match the snapshot for [%s]", credentialType => {
    expect(
      getLegacyThemeColorByCredentialType(credentialType)
    ).toMatchSnapshot();
  });

  it("should fall back to the PID colors for unknown credential types", () => {
    expect(getLegacyThemeColorByCredentialType("unknown")).toEqual(
      getLegacyThemeColorByCredentialType(CredentialType.PID)
    );
  });
});
