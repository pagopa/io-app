/*
SEMANTIC COLORS
One object per mode, from the Figma `Semantics` collection
(`Color/Text/Content/Error` → `text.content.error`). Values reference the
palette; `dark` must define every token of `light`.
Groups are properties shared across components: no component names, no
states (both live in component configs). A status color at the root of a
group sits on a neutral background; `onTint` holds the ones on the matching
`surface` tint, `onColor` the ones on a solid fill.
It also defines the shape every component color config shares.
*/

import { IOTokenColor, IOColorPalette as p } from "./palette";
import { withAlpha } from "./utils";

export type IOColorMode = "dark" | "light";

/* Same shape as `T`, leaves widened: a token can be opaque in one mode only */
export type IOColorScheme<T> = {
  [K in keyof T]: T[K] extends string ? IOTokenColor : IOColorScheme<T[K]>;
};

/* State colors of one role: `default` is required */
export type IOColorStates = Partial<
  Record<"disabled" | "pressed", IOComponentColor>
> & { default: IOComponentColor };

/* A color a component can apply: a token, or none */
export type IOComponentColor = "transparent" | IOTokenColor;

/* Colors of one component variant, by role then state */
export type IOComponentColors = {
  background?: IOColorStates;
  border?: IOColorStates;
  /* Text, icon and spinner */
  foreground: IOColorStates;
};

export type Named<T> = { [key: string]: Named<T> | T };

export const light = {
  background: {
    default: p.greyscale.white,
    secondary: p.greyscale[50],
    tertiary: p.greyscale[100],
    accent: p.blueIO[500],
    overlay: withAlpha(p.greyscale.black, 0.15)
  },
  surface: {
    default: p.greyscale.white,
    secondary: p.greyscale[50],
    tertiary: p.greyscale[100],
    accent: p.blueIO[50],
    error: p.red[100],
    info: p.lightBlue[100],
    success: p.green[100],
    warning: p.yellow[100],
    highlight: p.turquoise[50]
  },
  icon: {
    default: p.greyscale[650],
    strong: p.greyscale.black,
    decorative: p.greyscale[300],
    action: p.blueIO[500],
    error: p.red[600],
    info: p.lightBlue[700],
    success: p.green[700],
    warning: p.yellow[700],
    onTint: {
      error: p.red[850],
      info: p.lightBlue[850],
      success: p.green[850],
      warning: p.yellow[850]
    },
    onColor: { default: p.greyscale.white }
  },
  pictogram: {
    hand: p.blueIO[500],
    fill: p.turquoise[150],
    accent: p.turquoise[500],
    tertiary: p.blueIO[400],
    onColor: {
      hand: p.greyscale.white,
      fill: p.turquoise[150],
      accent: p.turquoise[500]
    }
  },
  text: {
    heading: {
      default: p.greyscale.black,
      secondary: p.greyscale[850],
      tertiary: p.greyscale[700],
      onColor: { default: p.greyscale.white }
    },
    content: {
      default: p.greyscale.black,
      secondary: p.greyscale[850],
      tertiary: p.greyscale[700],
      action: p.blueIO[500],
      error: p.red[600],
      info: p.lightBlue[700],
      success: p.green[700],
      warning: p.yellow[700],
      onTint: {
        error: p.red[850],
        info: p.lightBlue[850],
        success: p.green[850],
        warning: p.yellow[850],
        highlight: p.turquoise[850]
      },
      onColor: { default: p.greyscale.white }
    },
    helper: { default: p.greyscale[700] },
    /* Short labels (badges): more saturated than body text in dark mode */
    label: {
      onTint: {
        accent: p.blueIO[850],
        error: p.red[850],
        success: p.green[850],
        warning: p.yellow[850],
        highlight: p.turquoise[850]
      }
    }
  },
  stroke: {
    default: p.greyscale[100],
    focused: p.blueIO[500],
    input: p.greyscale[200],
    inputStrong: p.greyscale[650],
    error: p.red[600],
    highlight: p.turquoise[850],
    warning: p.yellow[850],
    success: p.green[850],
    onColor: { default: p.greyscale.white, error: p.red[850] }
  }
} as const satisfies Named<IOTokenColor>;

export type IOColorSemantics = IOColorScheme<typeof light>;

export const dark = {
  background: {
    default: p.greyscale.black,
    secondary: p.greyscale[900],
    tertiary: p.greyscale[700],
    accent: p.blueIO[500],
    overlay: withAlpha(p.greyscale.black, 0.7)
  },
  surface: {
    default: p.greyscale.black,
    secondary: p.greyscale[900],
    tertiary: p.greyscale[700],
    accent: withAlpha(p.blueIO[200], 0.2),
    error: withAlpha(p.red[400], 0.2),
    info: withAlpha(p.lightBlue[400], 0.2),
    success: withAlpha(p.green[400], 0.2),
    warning: withAlpha(p.yellow[400], 0.2),
    highlight: withAlpha(p.turquoise[300], 0.2)
  },
  icon: {
    default: p.greyscale[450],
    strong: p.greyscale.white,
    decorative: p.greyscale[650],
    action: p.blueIO[300],
    error: p.red[400],
    info: p.lightBlue[500],
    success: p.green[500],
    warning: p.yellow[500],
    onTint: {
      error: p.red[100],
      info: p.lightBlue[100],
      success: p.green[100],
      warning: p.yellow[100]
    },
    onColor: { default: p.greyscale.white }
  },
  pictogram: {
    hand: p.greyscale.white,
    fill: p.turquoise[150],
    accent: p.turquoise[500],
    tertiary: p.blueIO[400],
    onColor: {
      hand: p.greyscale.white,
      fill: p.turquoise[150],
      accent: p.turquoise[500]
    }
  },
  text: {
    heading: {
      default: p.greyscale.white,
      secondary: p.greyscale[300],
      tertiary: p.greyscale[450],
      onColor: { default: p.greyscale.white }
    },
    content: {
      default: p.greyscale.white,
      secondary: p.greyscale[100],
      tertiary: p.greyscale[300],
      action: p.blueIO[300],
      error: p.red[400],
      info: p.lightBlue[400],
      success: p.green[400],
      warning: p.yellow[400],
      onTint: {
        error: p.red[100],
        info: p.lightBlue[100],
        success: p.green[100],
        warning: p.yellow[100],
        highlight: p.turquoise[100]
      },
      onColor: { default: p.greyscale.white }
    },
    helper: { default: p.greyscale[450] },
    label: {
      onTint: {
        accent: p.blueIO[200],
        error: p.red[400],
        success: p.green[400],
        warning: p.yellow[400],
        highlight: p.turquoise[300]
      }
    }
  },
  stroke: {
    default: p.greyscale[850],
    focused: p.blueIO[300],
    input: p.greyscale[850],
    inputStrong: p.greyscale[450],
    error: p.red[400],
    highlight: p.greyscale.white,
    warning: p.greyscale.white,
    success: p.greyscale.white,
    onColor: { default: p.greyscale.white, error: p.greyscale.white }
  }
} as const satisfies IOColorSemantics;
