import { render } from "@testing-library/react-native";
import { CredentialType } from "../../../utils/itwMocksUtils.ts";
import { CardBackground, LegacyCardBackground } from "../CardBackground.tsx";
import { CredentialCardBackground } from "../config.ts";
import { CardColorScheme } from "../types.ts";

const mockBackground: CredentialCardBackground = {
  colors: ["#EAF6FF", "#F9F9F9"],
  angle: 217
};

const mockBackgroundWithPositions: CredentialCardBackground = {
  colors: ["#FADCF5", "#FFECFC", "#FADCF5"],
  positions: [0.0, 0.5, 1.0],
  angle: 90
};

describe("CardBackground", () => {
  it("renders with minimum required props", () => {
    const component = render(
      <CardBackground background={mockBackground} color="#EAF6FF" />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });

  it("renders with showCornerOverlay enabled", () => {
    const component = render(
      <CardBackground
        background={mockBackground}
        color="#EAF6FF"
        showCornerOverlay
      />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });

  it("renders with an overlay image", () => {
    const component = render(
      <CardBackground background={mockBackground} color="#EAF6FF" overlay={1} />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });

  it("renders with overlay and soft-light blend mode", () => {
    const component = render(
      <CardBackground
        background={mockBackground}
        color="#EAF6FF"
        overlay={1}
        overlayBlend
      />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });

  it("renders with all optional props enabled", () => {
    const component = render(
      <CardBackground
        background={mockBackgroundWithPositions}
        color="#FADCF5"
        overlay={1}
        overlayBlend
        showCornerOverlay
      />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });
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
