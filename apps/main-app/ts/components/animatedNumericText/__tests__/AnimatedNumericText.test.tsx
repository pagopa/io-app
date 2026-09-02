import {
  accessibilityLabel as accessibilityLabelModifier,
  animation,
  contentTransition,
  font,
  foregroundStyle
} from "@expo/ui/swift-ui/modifiers";
import { IOColors } from "@io-app/design-system";
import { render } from "@testing-library/react-native";

import { AnimatedNumericText } from "../AnimatedNumericText";

/* The `react-native` Jest preset resolves `.ios` files by default, so the
   baseline implementation has to be required by its exact file name. */
const { AnimatedNumericText: BaselineNumericText } = jest.requireActual<
  typeof import("../AnimatedNumericText")
>("../AnimatedNumericText.tsx");

describe("AnimatedNumericText", () => {
  describe.each([
    { Component: AnimatedNumericText, platform: "iOS (SwiftUI)" },
    { Component: BaselineNumericText, platform: "baseline" }
  ])("$platform implementation", ({ Component }) => {
    it("renders the raw value when no formatter is given", () => {
      const { getByText } = render(
        <Component accessibilityLabel="remaining time" value={42} />
      );

      expect(getByText("42")).toBeTruthy();
    });

    it("renders the formatted value when a formatter is given", () => {
      const { getByText } = render(
        <Component
          accessibilityLabel="remaining time"
          formatValue={seconds =>
            `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
              2,
              "0"
            )}`
          }
          value={62}
        />
      );

      expect(getByText("1:02")).toBeTruthy();
    });
  });

  /* The SwiftUI views are mocked away, so the modifiers are the only
     observable part of the iOS implementation. */
  describe("iOS (SwiftUI) modifiers", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("styles the text with the resolved face, size and color", () => {
      render(
        <AnimatedNumericText
          accessibilityLabel="remaining time"
          color="blueIO-500"
          size={20}
          value={42}
          weight="Bold"
        />
      );

      expect(jest.mocked(font)).toHaveBeenCalledWith({
        family: "Titillio-Bold",
        size: 20
      });
      expect(jest.mocked(foregroundStyle)).toHaveBeenCalledWith(
        IOColors["blueIO-500"]
      );
    });

    it("labels the text, which sits outside the React Native text tree", () => {
      render(
        <AnimatedNumericText accessibilityLabel="remaining time" value={42} />
      );

      expect(jest.mocked(accessibilityLabelModifier)).toHaveBeenCalledWith(
        "remaining time"
      );
    });

    it("animates the transition on the value, counting down by default", () => {
      render(
        <AnimatedNumericText accessibilityLabel="remaining time" value={42} />
      );

      expect(jest.mocked(contentTransition)).toHaveBeenCalledWith(
        "numericText",
        { countsDown: true }
      );
      expect(jest.mocked(animation)).toHaveBeenCalledWith(
        expect.anything(),
        42
      );
    });

    it("rolls the digits upwards when the value counts up", () => {
      render(
        <AnimatedNumericText
          accessibilityLabel="elapsed time"
          countsDown={false}
          value={42}
        />
      );

      expect(jest.mocked(contentTransition)).toHaveBeenCalledWith(
        "numericText",
        { countsDown: false }
      );
    });
  });
});
