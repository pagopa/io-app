import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { IOPictogramsProps, PictogramPalette } from "./Pictogram";

/* By SVG slot. `dark-content` is `default` in light mode, not a variant */
export const pictogramColors = (s: IOColorSemantics) =>
  ({
    default: {
      hands: s.pictogram.hand,
      main: s.pictogram.fill,
      secondary: s.pictogram.highlight,
      tertiary: s.pictogram.accent
    },
    "light-content": {
      hands: s.pictogram.onAccent.hand,
      main: s.pictogram.onAccent.fill,
      secondary: s.pictogram.onAccent.highlight,
      tertiary: s.pictogram.onAccent.accent
    }
  }) satisfies Record<
    Exclude<NonNullable<IOPictogramsProps["pictogramStyle"]>, "dark-content">,
    Record<keyof PictogramPalette, IOComponentColor<"foreground">>
  >;
