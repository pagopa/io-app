/*
SEMANTIC COLORS
One object per mode, from the Figma `Semantics` collection
(`Color/Text/Content/Error` → `text.content.error`). Values reference the
palette; `dark` must define every token of `light`.
Groups are properties shared across components: no component names, no
states (both live in component configs), except the `action` subgroups
(`surface.action` fills, `foreground.action` ink) of interactive elements.
`foreground` is the ink of components whose icon and text share a color
(buttons, alerts); `icon` and `text` the ones where they differ.
A status color at the root of a group sits on a neutral background;
`on<Background>` names what the ink sits on: `onTint` the matching `surface`
tint, `onAccent` `background.accent`, `onAction` the matching `surface.action`
fill.
Product intents (`cgn`, `pagopa`) only for products a DS component or icon
shows; colors of a single feature live in that feature.
It also defines the shape every component color config shares.
*/

import {
  IOColorRole,
  IORoleColor,
  IOTokenColor,
  IOColorPalette as p
} from "./palette";
import { withAlpha } from "./utils";

export type IOColorMode = "dark" | "light";

/* Same shape as `T`, leaves widened: a token can be opaque in one mode only */
export type IOColorScheme<T> = {
  [K in keyof T]: T[K] extends string ? IOTokenColor : IOColorScheme<T[K]>;
};

/* State colors of one role: `default` is required */
export type IOColorStates<R extends IOColorRole = IOColorRole> = Partial<
  Record<"disabled" | "pressed", IOComponentColor<R>>
> & { default: IOComponentColor<R> };

/* A color a component can apply: a token of that role, or none */
export type IOComponentColor<R extends IOColorRole = IOColorRole> =
  | "transparent"
  | IORoleColor<R>;

/* Colors of one component variant, by role then state */
export type IOComponentColors = {
  background?: IOColorStates<"background">;
  border?: IOColorStates<"stroke">;
  /* Text, icon and spinner */
  foreground: IOColorStates<"foreground">;
};

export type Named<T> = { [key: string]: Named<T> | T };

export const light = {
  /** The whole screen. Role: `background` */
  background: {
    default: p.greyscale.white,
    secondary: p.greyscale[50],
    tertiary: p.greyscale[100],
    accent: p.blueIO[500],
    overlay: withAlpha(p.greyscale.black, 0.15)
  },
  /**
   * What sits on the background (cards, alerts, tints); `action` holds
   * interactive fills, with states. Role: `background`
   */
  surface: {
    default: p.greyscale.white,
    secondary: p.greyscale[50],
    tertiary: p.greyscale[100],
    accent: p.blueIO[50],
    error: p.red[100],
    info: p.lightBlue[100],
    success: p.green[100],
    warning: p.yellow[100],
    highlight: p.turquoise[50],
    /* Product */
    cgn: p.hanPurple[100],
    /* Fill of interactive elements */
    action: {
      primary: {
        default: p.blueIO[500],
        pressed: p.blueIO[600],
        disabled: p.greyscale[300]
      },
      danger: {
        default: p.red[600],
        pressed: p.red[500],
        disabled: p.greyscale[300]
      },
      /* On `background.accent` */
      inverse: {
        default: p.greyscale.white,
        pressed: p.blueIO[50],
        disabled: p.blueIO[50]
      }
    }
  },
  /**
   * Ink of components whose icon and text share a color (buttons, alerts);
   * `action` holds interactive ink, with states. Role: `foreground`
   */
  foreground: {
    /* Ink of interactive elements */
    action: {
      primary: {
        default: p.blueIO[500],
        pressed: p.blueIO[600],
        disabled: p.greyscale[700]
      },
      neutral: {
        default: p.greyscale.black,
        pressed: p.greyscale[850],
        disabled: p.greyscale[700]
      },
      danger: {
        default: p.red[600],
        pressed: p.red[600],
        disabled: p.greyscale[700]
      },
      /* On `background.accent` */
      inverse: {
        default: p.greyscale.white,
        pressed: p.blueIO[50],
        disabled: p.greyscale.white
      }
    },
    onTint: {
      error: p.red[850],
      info: p.lightBlue[850],
      success: p.green[850],
      warning: p.yellow[850]
    },
    onAction: {
      primary: p.greyscale.white,
      danger: p.greyscale.white,
      inverse: p.blueIO[500],
      disabled: p.greyscale[700]
    }
  },
  /**
   * Ink of icons in components where icon and text differ (list items, tags).
   * Role: `foreground`
   */
  icon: {
    default: p.greyscale[650],
    strong: p.greyscale.black,
    decorative: p.greyscale[300],
    action: p.blueIO[500],
    error: p.red[600],
    info: p.lightBlue[700],
    success: p.green[700],
    warning: p.yellow[700],
    /* Product */
    pagopa: p.blueItalia[500],
    onTint: {
      error: p.red[850],
      info: p.lightBlue[850],
      success: p.green[850],
      warning: p.yellow[850]
    },
    onAccent: { default: p.greyscale.white }
  },
  /** Ink of pictograms. Role: `foreground` */
  pictogram: {
    hand: p.blueIO[500],
    fill: p.turquoise[150],
    accent: p.turquoise[500],
    tertiary: p.blueIO[400],
    onAccent: {
      hand: p.greyscale.white,
      fill: p.turquoise[150],
      accent: p.turquoise[500]
    }
  },
  /**
   * Ink of text in components where icon and text differ (list items, tags).
   * Role: `foreground`
   */
  text: {
    heading: {
      default: p.greyscale.black,
      secondary: p.greyscale[850],
      tertiary: p.greyscale[700],
      onAccent: { default: p.greyscale.white }
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
      onAccent: { default: p.greyscale.white }
    },
    helper: { default: p.greyscale[700] },
    /* Short labels (badges): more saturated than body text in dark mode */
    label: {
      onTint: {
        accent: p.blueIO[850],
        error: p.red[850],
        success: p.green[850],
        warning: p.yellow[850],
        highlight: p.turquoise[850],
        /* Product */
        cgn: p.hanPurple[500]
      }
    }
  },
  /** Borders and dividers. Role: `stroke` (the `border` of a component) */
  stroke: {
    default: p.greyscale[100],
    focused: p.blueIO[500],
    input: p.greyscale[200],
    inputStrong: p.greyscale[650],
    error: p.red[600],
    highlight: p.turquoise[850],
    warning: p.yellow[850],
    success: p.green[850],
    onAccent: { default: p.greyscale.white, error: p.red[850] }
  }
} as const satisfies Named<IOTokenColor>;

/* The semantic tokens, each tagged with its group's role */
export type IOColorSemantics = {
  [G in keyof typeof light]: IORoleScheme<(typeof light)[G], GroupRole<G>>;
};

type GroupRole<G> = G extends "background" | "surface"
  ? "background"
  : G extends "stroke"
    ? "stroke"
    : "foreground";

type IORoleScheme<T, R extends IOColorRole> = {
  [K in keyof T]: T[K] extends string ? IORoleColor<R> : IORoleScheme<T[K], R>;
};

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
    /* Darker than the other tints: keeps `text.content.action` at AA on `background.secondary` too */
    highlight: withAlpha(p.turquoise[600], 0.1),
    /* Product */
    cgn: withAlpha(p.hanPurple[250], 0.2),
    action: {
      primary: {
        default: p.blueIO[300],
        pressed: p.blueIO[400],
        disabled: p.greyscale[700]
      },
      danger: {
        default: p.red[600],
        pressed: p.red[500],
        disabled: p.greyscale[700]
      },
      inverse: {
        default: p.greyscale.white,
        pressed: p.blueIO[50],
        disabled: p.blueIO[50]
      }
    }
  },
  foreground: {
    action: {
      primary: {
        default: p.blueIO[300],
        pressed: p.blueIO[400],
        disabled: p.greyscale[300]
      },
      neutral: {
        default: p.greyscale.white,
        pressed: p.greyscale[100],
        disabled: p.greyscale[300]
      },
      /* Red 400: the fill's red 600 is below AA as ink on black */
      danger: {
        default: p.red[400],
        pressed: p.red[400],
        disabled: p.greyscale[300]
      },
      inverse: {
        default: p.greyscale.white,
        pressed: p.blueIO[50],
        disabled: p.greyscale.white
      }
    },
    onTint: {
      error: p.red[100],
      info: p.lightBlue[100],
      success: p.green[100],
      warning: p.yellow[100]
    },
    /* Black on primary: the fill is lighter in dark mode */
    onAction: {
      primary: p.greyscale.black,
      danger: p.greyscale.white,
      inverse: p.blueIO[500],
      disabled: p.greyscale[300]
    }
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
    /* Product */
    pagopa: p.blueItalia[300],
    onTint: {
      error: p.red[100],
      info: p.lightBlue[100],
      success: p.green[100],
      warning: p.yellow[100]
    },
    onAccent: { default: p.greyscale.white }
  },
  pictogram: {
    hand: p.greyscale.white,
    fill: p.turquoise[150],
    accent: p.turquoise[500],
    tertiary: p.blueIO[400],
    onAccent: {
      hand: p.greyscale.white,
      fill: p.turquoise[150],
      accent: p.turquoise[500]
    }
  },
  text: {
    heading: {
      default: p.greyscale.white,
      /* Above `text.content.tertiary` (300) */
      secondary: p.greyscale[100],
      tertiary: p.greyscale[450],
      onAccent: { default: p.greyscale.white }
    },
    content: {
      default: p.greyscale.white,
      secondary: p.greyscale[100],
      tertiary: p.greyscale[300],
      action: p.blueIO[300],
      error: p.red[400],
      info: p.lightBlue[500],
      success: p.green[500],
      warning: p.yellow[500],
      onTint: {
        error: p.red[100],
        info: p.lightBlue[100],
        success: p.green[100],
        warning: p.yellow[100],
        highlight: p.turquoise[100]
      },
      onAccent: { default: p.greyscale.white }
    },
    helper: { default: p.greyscale[450] },
    label: {
      onTint: {
        accent: p.blueIO[200],
        error: p.red[400],
        success: p.green[400],
        warning: p.yellow[400],
        highlight: p.turquoise[300],
        /* Product */
        cgn: p.hanPurple[250]
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
    onAccent: { default: p.greyscale.white, error: p.greyscale.white }
  }
} as const satisfies IOColorScheme<typeof light>;
