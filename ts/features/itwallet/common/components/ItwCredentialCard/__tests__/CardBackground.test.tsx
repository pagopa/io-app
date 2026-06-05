import { render } from "@testing-library/react-native";
import { CredentialType } from "../../../utils/itwMocksUtils.ts";
import { CardBackground, LegacyCardBackground } from "../CardBackground.tsx";
import { CredentialCardBackground, CredentialCardOverlay } from "../config.ts";
import { CardColorScheme } from "../types.ts";

// --- Fixtures ---

const twoColorBackground: CredentialCardBackground<2> = {
  type: "linear",
  colors: ["#EAF6FF", "#F9F9F9"],
  angle: 217
};

const threeColorBackgroundWithPositions: CredentialCardBackground<3> = {
  type: "linear",
  colors: ["#FADCF5", "#FFECFC", "#FADCF5"],
  positions: [0.0, 0.5, 1.0],
  angle: 90
};

const cardOverlay: CredentialCardOverlay = {
  card: require("../../../../../../../img/features/itWallet/cards/overlay/pid_card.png")
};

const patternOverlay: CredentialCardOverlay = {
  pattern: require("../../../../../../../img/features/itWallet/cards/overlay/pattern/identity.png")
};

const patternOverlayWithCorner: CredentialCardOverlay = {
  pattern: require("../../../../../../../img/features/itWallet/cards/overlay/pattern/identity.png"),
  showCornerOverlay: true
};

// --- CardBackground ---

const backgroundScenarios: Array<{
  name: string;
  background: CredentialCardBackground;
  color: string;
}> = [
  {
    name: "two-color gradient",
    background: twoColorBackground,
    color: "#EAF6FF"
  },
  {
    name: "three-color gradient with explicit positions",
    background: threeColorBackgroundWithPositions,
    color: "#FADCF5"
  }
];

describe("CardBackground", () => {
  describe.each(backgroundScenarios)(
    "with $name background",
    ({ background, color }) => {
      it("renders without overlay", () => {
        const component = render(
          <CardBackground background={background} color={color} />
        ).toJSON();
        expect(component).toMatchSnapshot();
      });

      it("renders with a fixed card overlay", () => {
        const component = render(
          <CardBackground
            background={background}
            color={color}
            overlay={cardOverlay}
          />
        ).toJSON();
        expect(component).toMatchSnapshot();
      });

      it("renders with a pattern overlay", () => {
        const component = render(
          <CardBackground
            background={background}
            color={color}
            overlay={patternOverlay}
          />
        ).toJSON();
        expect(component).toMatchSnapshot();
      });

      it("renders with a pattern overlay and corner overlay", () => {
        const component = render(
          <CardBackground
            background={background}
            color={color}
            overlay={patternOverlayWithCorner}
          />
        ).toJSON();
        expect(component).toMatchSnapshot();
      });
    }
  );
});

// --- LegacyCardBackground ---

/**
 * Credential types that have dedicated background images. The image opacity and
 * blend mode vary by colorScheme.
 */
const credentialTypesWithImages = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
];

/**
 * Credential types without dedicated images; they fall back to a LinearGradient
 * derived from `legacyCredentialGradientColors`.
 */
const credentialTypesWithGradientFallback = [
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY
];

const colorSchemes: ReadonlyArray<CardColorScheme> = [
  "default",
  "faded",
  "greyscale"
];

describe("LegacyCardBackground", () => {
  describe("credential types with dedicated card images", () => {
    describe.each(credentialTypesWithImages)(
      "credentialType = %s",
      credentialType => {
        it.each(colorSchemes)(
          "renders correctly in %s color scheme",
          colorScheme => {
            const component = render(
              <LegacyCardBackground
                credentialType={credentialType}
                colorScheme={colorScheme}
              />
            ).toJSON();
            expect(component).toMatchSnapshot();
          }
        );
      }
    );
  });

  describe("credential types with gradient fallback (no image)", () => {
    describe.each(credentialTypesWithGradientFallback)(
      "credentialType = %s",
      credentialType => {
        it.each(colorSchemes)(
          "renders gradient fallback in %s color scheme",
          colorScheme => {
            const component = render(
              <LegacyCardBackground
                credentialType={credentialType}
                colorScheme={colorScheme}
              />
            ).toJSON();
            expect(component).toMatchSnapshot();
          }
        );
      }
    );
  });
});
