import {
  IOColorPalette,
  IOColors,
  IOThemeContextProvider,
  withAlpha
} from "@io-app/design-system";
import { renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import {
  IOFeatureColors,
  IOFeatureColorsConfig,
  useFeatureColors
} from "../useFeatureColors";

const testColors: IOFeatureColorsConfig<IOFeatureColors> = (s, mode) => ({
  card: {
    background:
      mode === "dark" ? IOColorPalette.blueIO[850] : IOColorPalette.blueIO[50],
    text: s.text.heading.default
  }
});

const renderInMode = (theme: "dark" | "light") =>
  renderHook(() => useFeatureColors(testColors), {
    wrapper: ({ children }: PropsWithChildren) => (
      <IOThemeContextProvider theme={theme}>{children}</IOThemeContextProvider>
    )
  }).result.current;

/* Compiles only with a well-formed config */
const accept = <T extends IOFeatureColors>(config: IOFeatureColorsConfig<T>) =>
  config;

describe("useFeatureColors", () => {
  it("should return the colors of the light mode", () => {
    expect(renderInMode("light")).toEqual({
      card: {
        background: IOColorPalette.blueIO[50],
        text: IOColors.light.text.heading.default
      }
    });
  });

  it("should return the colors of the dark mode", () => {
    expect(renderInMode("dark")).toEqual({
      card: {
        background: IOColorPalette.blueIO[850],
        text: IOColors.dark.text.heading.default
      }
    });
  });

  it("should accept only tokens and custom hexes in a config", () => {
    const custom = "#123456" as const;
    const valid = accept(s => ({
      a: s.surface.secondary,
      b: IOColorPalette.greyscale.white,
      c: withAlpha(IOColorPalette.greyscale.black, 0.2),
      d: custom
    }));
    expect(valid(IOColors.light, "light").d).toBe(custom);

    // @ts-expect-error a CSS color name
    accept(() => ({ a: "red" }));
    // @ts-expect-error a legacy color name
    accept(() => ({ a: "grey-700" }));
    // @ts-expect-error an alpha outside the `IOOpacity` scale
    accept(() => ({ a: withAlpha(IOColorPalette.greyscale.black, 0.3) }));
    // @ts-expect-error a color missing in one mode
    accept((_, mode) => ({ a: mode === "dark" ? undefined : custom }));
    // @ts-expect-error a value that isn't a color
    accept(() => ({ a: { b: 4 } }));
  });
});
