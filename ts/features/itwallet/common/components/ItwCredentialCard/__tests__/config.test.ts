import { ColorSchemeName } from "react-native";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { getCredentialCardConfig } from "../config.ts";

describe("getCredentialCardConfig", () => {
  describe.each(["light", "dark", undefined])(
    "when color scheme is [%s]",
    colorScheme => {
      test.each([
        // Known credential types with static config
        CredentialType.PID,
        CredentialType.DRIVING_LICENSE,
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        CredentialType.EUROPEAN_DISABILITY_CARD,
        CredentialType.AGE_VERIFICATION,
        // Known credential types without static config (use random generation)
        CredentialType.EDUCATION_ATTENDANCE,
        CredentialType.EDUCATION_DEGREE,
        CredentialType.EDUCATION_DIPLOMA,
        CredentialType.EDUCATION_ENROLLMENT,
        CredentialType.RESIDENCY,
        // Unknown / future credential types
        "unknown_credential_type",
        "org.iso.someNewCredential",
        "eu.europa.ec.eudi.pid.1",
        "eu.europa.ec.eudi.mdl.1",
        // Edge-cases
        "",
        "a",
        "🪪"
      ])("should match snapshot for type [%s]", type => {
        expect(
          getCredentialCardConfig(type, colorScheme as ColorSchemeName)
        ).toMatchSnapshot();
      });
    }
  );
});
