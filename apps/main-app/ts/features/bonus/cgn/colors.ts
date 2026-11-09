import {
  IOColorMode,
  IOColorPalette,
  IOColorTheme,
  withAlpha
} from "@io-app/design-system";

/* Hues outside the palette */
const detailCardShapeLight = "#C8C3DC";
const detailCardShapeDark = "#A58DFF";
// hanPurple 250 at 20% over black, solid: `useHeaderSecondLevel` can't take `rgba`
const discountHeaderNewDark = "#343141";

/** CGN colors of a mode. Read the current mode's with `useCgnColors()` */
export const cgnColors = (s: IOColorTheme, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    /** Card on the CGN detail screen, behind the animated shapes */
    detailCard: {
      background: isDark
        ? IOColorPalette.greyscale[850]
        : IOColorPalette.greyscale[50],
      foreground: isDark
        ? withAlpha(detailCardShapeDark, 0.4)
        : detailCardShapeLight,
      text: isDark ? IOColorPalette.blueIO[50] : IOColorPalette.blueItalia[850]
    },
    detailFooter: s.text.heading.default,
    /** CGN card in the wallet */
    walletCard: {
      text: isDark
        ? IOColorPalette.greyscale[50]
        : IOColorPalette.blueItalia[850],
      logoBackground: IOColorPalette.greyscale.white
    },
    refreshIndicator: isDark
      ? IOColorPalette.blueIO[50]
      : IOColorPalette.blueItalia[850],
    discountModule: {
      default: {
        backgroundColor: s.surface.secondary,
        borderColor: s.stroke.default
      },
      new: {
        backgroundColor: isDark
          ? withAlpha(IOColorPalette.hanPurple[250], 0.2)
          : IOColorPalette.hanPurple[50],
        borderColor: isDark
          ? withAlpha(IOColorPalette.hanPurple[250], 0.35)
          : IOColorPalette.hanPurple[250]
      },
      title: s.text.heading.secondary,
      chevron: s.icon.action
    },
    discountHeader: {
      default: {
        backgroundColor: s.surface.secondary,
        foreground: s.text.heading.default
      },
      new: {
        backgroundColor: isDark
          ? discountHeaderNewDark
          : IOColorPalette.hanPurple[50],
        foreground: s.text.heading.default
      }
    },
    merchantCard: {
      border: IOColorPalette.hanPurple[100],
      newsBadge: IOColorPalette.hanPurple[100]
    },
    category: {
      iconBackground: withAlpha(IOColorPalette.greyscale.white, 0.2),
      /** Text and icons over a category color, by the category's `textColor` */
      content: {
        black: IOColorPalette.greyscale.black,
        white: IOColorPalette.greyscale.white
      }
    }
  };
};
