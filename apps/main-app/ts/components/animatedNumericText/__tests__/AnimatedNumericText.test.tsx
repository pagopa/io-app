import {
  accessibilityLabel as accessibilityLabelModifier,
  animation,
  contentTransition,
  font,
  foregroundStyle
} from "@expo/ui/swift-ui/modifiers";
import { IOColors } from "@io-app/design-system";
import { render } from "@testing-library/react-native";
import { Platform } from "react-native";

import { AnimatedNumericText } from "../AnimatedNumericText";
import { BaselineNumericText } from "../BaselineNumericText";

/* `Platform.Version` is a getter with no value under Jest, and the iOS
   implementation reads it to decide whether SwiftUI can animate the digits. */
const mockIOSVersion = (version: string) =>
  jest.spyOn(Platform, "Version", "get").mockReturnValue(version);

describe("AnimatedNumericText", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    { Component: AnimatedNumericText, platform: "iOS (SwiftUI)" },
    { Component: BaselineNumericText, platform: "baseline" }
  ])("$platform implementation", ({ Component }) => {
    beforeEach(() => {
      mockIOSVersion("18.0");
    });

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
      mockIOSVersion("18.0");
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

    /* The transition only runs if SwiftUI is handed the new value, so a stale
       `animation` argument would silently freeze the digits. */
    it.each([
      { countsDown: true, name: "decrementing", next: 41 },
      { countsDown: false, name: "incrementing", next: 43 }
    ])("animates on the updated value while $name", ({ countsDown, next }) => {
      const { getByText, rerender } = render(
        <AnimatedNumericText
          accessibilityLabel="remaining time"
          countsDown={countsDown}
          value={42}
        />
      );

      jest.clearAllMocks();

      rerender(
        <AnimatedNumericText
          accessibilityLabel="remaining time"
          countsDown={countsDown}
          value={next}
        />
      );

      expect(getByText(String(next))).toBeTruthy();
      expect(jest.mocked(animation)).toHaveBeenCalledWith(
        expect.anything(),
        next
      );
      expect(jest.mocked(contentTransition)).toHaveBeenCalledWith(
        "numericText",
        { countsDown }
      );
    });
  });

  /* Below iOS 16 SwiftUI cannot animate the transition, so leaving the React
     Native text tree would only cost accessibility features. The `@expo/ui`
     views are mocked as host components, so the rendered root is what tells the
     two implementations apart. */
  describe("implementation picked for the running iOS version", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("hands the text to SwiftUI from iOS 16 onwards", () => {
      mockIOSVersion("18.0");

      const { toJSON } = render(
        <AnimatedNumericText accessibilityLabel="remaining time" value={42} />
      );

      expect(toJSON()).toMatchObject({ type: "Host" });
      expect(jest.mocked(contentTransition)).toHaveBeenCalled();
    });

    it("keeps the text in the React Native tree below iOS 16", () => {
      mockIOSVersion("15.1");

      const { toJSON } = render(
        <AnimatedNumericText accessibilityLabel="remaining time" value={42} />
      );

      expect(toJSON()).toMatchObject({ type: "Text" });
      expect(jest.mocked(contentTransition)).not.toHaveBeenCalled();
      expect(jest.mocked(animation)).not.toHaveBeenCalled();
    });
  });
});
