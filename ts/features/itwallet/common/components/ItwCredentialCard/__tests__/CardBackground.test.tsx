import { render } from "@testing-library/react-native";
import { CredentialType } from "../../../utils/itwMocksUtils.ts";
import { CardBackground, LegacyCardBackground } from "../CardBackground.tsx";
import { CardColorScheme } from "../types.ts";

describe("CardBackground", () => {
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
  ])(
    "should correctly render background for credential type [%s]",
    credentialType => {
      const component = render(
        <CardBackground credentialType={credentialType} />
      ).toJSON();

      expect(component).toMatchSnapshot();
    }
  );
});

describe("LegacyCardBackground", () => {
  it.each([
    [CredentialType.DRIVING_LICENSE, "default"],
    [CredentialType.DRIVING_LICENSE, "faded"],
    [CredentialType.DRIVING_LICENSE, "greyscale"],
    [CredentialType.EUROPEAN_DISABILITY_CARD, "default"],
    [CredentialType.EUROPEAN_DISABILITY_CARD, "faded"],
    [CredentialType.EUROPEAN_DISABILITY_CARD, "greyscale"],
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD, "default"],
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD, "faded"],
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD, "greyscale"]
  ])(
    "should correctly render background for credential type [%s] in state [%s]",
    (credentialType, colorScheme) => {
      const component = render(
        <LegacyCardBackground
          credentialType={credentialType}
          colorScheme={colorScheme as CardColorScheme}
        />
      ).toJSON();

      expect(component).toMatchSnapshot();
    }
  );
});
