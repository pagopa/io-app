import { NavigationContext } from "@react-navigation/native";
import { act, render } from "@testing-library/react-native";
import { Image, PixelRatio, Platform, StyleSheet } from "react-native";

import { CredentialType } from "../../../utils/itwMocksUtils.ts";
import { CardBackground, LegacyCardBackground } from "../CardBackground.tsx";
import {
  CredentialCardBackground,
  CredentialCardOverlay,
  getCredentialCardConfig
} from "../config.ts";
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
  background: CredentialCardBackground;
  color: string;
  name: string;
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

/** Navigation stub that lets a test emit focus and blur events */
const createFocusController = () => {
  const listeners = new Map<"blur" | "focus", Set<() => void>>([
    ["blur", new Set()],
    ["focus", new Set()]
  ]);
  const state = new Map([["focused", true]]);
  const navigation = {
    isFocused: () => state.get("focused") === true,
    addListener: (event: "blur" | "focus", listener: () => void) => {
      listeners.get(event)?.add(listener);
      return () => listeners.get(event)?.delete(listener);
    }
  };
  const emit = (event: "blur" | "focus") =>
    act(() => {
      state.set("focused", event === "focus");
      listeners.get(event)?.forEach(listener => listener());
    });
  return { navigation, emit };
};

describe("CardBackground rendering", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    {
      name: "a static config",
      credentialType: CredentialType.DRIVING_LICENSE,
      overlayTestID: "itwCredentialCardArtworkTestID"
    },
    {
      name: "a generated config",
      credentialType: CredentialType.EDUCATION_DEGREE,
      overlayTestID: "itwCredentialCardPatternTestID"
    }
  ])(
    "keeps the background mounted across blur and focus for $name",
    ({ credentialType, overlayTestID }) => {
      const { navigation, emit } = createFocusController();
      const { getByTestId } = render(
        <NavigationContext.Provider value={navigation as never}>
          <CardBackground
            {...getCredentialCardConfig(credentialType, "light")}
          />
        </NavigationContext.Provider>
      );
      const background = getByTestId("itwCredentialCardBackgroundTestID");
      const overlay = getByTestId(overlayTestID);

      emit("blur");
      emit("focus");

      expect(getByTestId("itwCredentialCardBackgroundTestID")).toBe(background);
      expect(getByTestId(overlayTestID)).toBe(overlay);
    }
  );

  test.each([
    {
      name: "on iOS with a pattern",
      os: "ios" as const,
      version: 18,
      overlay: patternOverlay,
      usesSkia: false
    },
    {
      name: "on Android 10 with a pattern",
      os: "android" as const,
      version: 29,
      overlay: patternOverlay,
      usesSkia: false
    },
    {
      name: "on Android 9 with a pattern",
      os: "android" as const,
      version: 28,
      overlay: patternOverlay,
      usesSkia: true
    },
    {
      name: "on Android 9 without a pattern",
      os: "android" as const,
      version: 28,
      overlay: cardOverlay,
      usesSkia: false
    }
  ])(
    "uses Skia only where the pattern blend is unsupported: $name",
    ({ os, version, overlay, usesSkia }) => {
      jest.replaceProperty(Platform, "OS", os);
      jest.spyOn(Platform, "Version", "get").mockReturnValue(version);

      const { queryByTestId } = render(
        <CardBackground
          background={twoColorBackground}
          color="#EAF6FF"
          overlay={overlay}
        />
      );

      expect(
        queryByTestId("itwCredentialCardSkiaBackgroundTestID") !== null
      ).toBe(usesSkia);
      expect(queryByTestId("itwCredentialCardBackgroundTestID") !== null).toBe(
        !usesSkia
      );
    }
  );

  test.each([
    {
      name: "Android 16 on a 420 dpi screen",
      version: 36,
      pixelRatio: 2.625,
      uri: "img_features_itwallet_cards_overlay_pattern_identity",
      scale: 2.625 / 3
    },
    {
      name: "Android 12 on a 340 dpi screen",
      version: 32,
      pixelRatio: 2.125,
      uri: "img_features_itwallet_cards_overlay_pattern_identity",
      scale: 2.125 / 2
    },
    {
      name: "Android 13 on a 340 dpi screen",
      version: 33,
      pixelRatio: 2.125,
      uri: "img_features_itwallet_cards_overlay_pattern_identity",
      scale: 2.125 / 3
    },
    {
      name: "a dev server asset on Android 12 on a 340 dpi screen",
      version: 32,
      pixelRatio: 2.125,
      uri: "http://localhost:8081/assets/identity.png",
      scale: 2.125 / 3
    }
  ])(
    "scales Android pattern tiles to the decoded asset for $name",
    ({ version, pixelRatio, uri, scale }) => {
      jest.replaceProperty(Platform, "OS", "android");
      jest.spyOn(Platform, "Version", "get").mockReturnValue(version);
      jest.spyOn(PixelRatio, "get").mockReturnValue(pixelRatio);
      jest
        .spyOn(Image, "resolveAssetSource")
        .mockReturnValue({ uri, width: 21, height: 20, scale: 3 });

      const { getByTestId } = render(
        <CardBackground
          background={twoColorBackground}
          color="#EAF6FF"
          overlay={patternOverlay}
        />
      );

      expect(
        StyleSheet.flatten(
          getByTestId("itwCredentialCardPatternTestID").props.style
        )
      ).toMatchObject({
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: [{ scale }]
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    { name: "iOS", os: "ios" as const, version: 18, blends: true },
    { name: "Android 10", os: "android" as const, version: 29, blends: true },
    { name: "Android 9", os: "android" as const, version: 28, blends: false }
  ])(
    "renders the greyscale artwork with the platform greyscale on $name",
    ({ os, version, blends }) => {
      jest.replaceProperty(Platform, "OS", os);
      jest.spyOn(Platform, "Version", "get").mockReturnValue(version);

      const { toJSON } = render(
        <LegacyCardBackground
          colorScheme="greyscale"
          credentialType={CredentialType.DRIVING_LICENSE}
        />
      );
      const serialized = JSON.stringify(toJSON());

      expect(serialized.includes('"mixBlendMode":"color"')).toBe(blends);
      expect(serialized.includes('"grayscale":1')).toBe(!blends);
    }
  );

  describe("credential types with dedicated card images", () => {
    describe.each(credentialTypesWithImages)(
      "credentialType = %s",
      credentialType => {
        it.each(colorSchemes)(
          "renders correctly in %s color scheme",
          colorScheme => {
            const component = render(
              <LegacyCardBackground
                colorScheme={colorScheme}
                credentialType={credentialType}
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
                colorScheme={colorScheme}
                credentialType={credentialType}
              />
            ).toJSON();
            expect(component).toMatchSnapshot();
          }
        );
      }
    );
  });
});
