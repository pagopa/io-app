import { ColorSchemeName } from "react-native";
import { CredentialType } from "../../../utils/itwMocksUtils";
import {
  generateCredentialCardConfig,
  getCredentialCardConfig
} from "../config.ts";

describe("getCredentialCardConfig", () => {
  test.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EDUCATION_ATTENDANCE,
    CredentialType.EDUCATION_DEGREE,
    CredentialType.EDUCATION_DIPLOMA,
    CredentialType.EDUCATION_ENROLLMENT,
    CredentialType.RESIDENCY,
    "unknown_credential_type"
  ])("should match snapshot for type [%s]", type => {
    expect(getCredentialCardConfig(type)).toMatchSnapshot();
  });
});

describe("generateCredentialCardConfig", () => {
  describe.each(["light", "dark", undefined])(
    "when color scheme is [%s]",
    colorScheme => {
      test.each([
        "#FFB357",
        "#CDD2FC",
        "#7AC1FA",
        "#003366",
        "#662088",
        "#FF4920",
        "#E9FE96",
        "#545028"
      ])("should match snapshot for color [%s] ", color => {
        expect(
          generateCredentialCardConfig(color, colorScheme as ColorSchemeName)
        ).toMatchSnapshot();
      });
    }
  );
});
