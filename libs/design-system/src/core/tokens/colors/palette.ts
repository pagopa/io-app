import { tagColors } from "./utils";

/*
COLOR PALETTE
Reference tier: every color the Design System can use.
Components never read it directly: semantic tokens do.
*/

export const IOColorPalette = tagColors<IOPaletteColor>()({
  greyscale: {
    white: "#FFFFFF",
    50: "#F4F5F8",
    100: "#E8EBF1",
    200: "#D2D6E3",
    300: "#BBC2D6",
    450: "#99A3C1",
    650: "#636B82",
    700: "#555C70",
    850: "#2B2E38",
    900: "#1D1F26",
    black: "#0E0F13"
  },
  blueIO: {
    50: "#E7ECFC",
    100: "#CED8F9",
    150: "#B6C5F7",
    200: "#9DB2F4",
    300: "#6D8BEE",
    400: "#3C65E9",
    500: "#0B3EE3",
    600: "#0932B6",
    850: "#031344"
  },
  hanPurple: {
    50: "#EEE8FC",
    100: "#DDD1F9",
    250: "#CCB9F7",
    500: "#5517E3",
    850: "#1A0744"
  },
  turquoise: {
    50: "#DBF9FA",
    100: "#C2F3F4",
    150: "#AAEEEF",
    300: "#61DCDF",
    450: "#19CBCF",
    500: "#00C5CA",
    600: "#009EA2",
    850: "#003B3D"
  },
  red: {
    100: "#FFD9D9",
    400: "#FF6666",
    500: "#FF4040",
    600: "#D13333",
    850: "#5D1313"
  },
  yellow: {
    100: "#FFF5DA",
    400: "#FFD56B",
    500: "#FFCB46",
    700: "#A5822A",
    850: "#614C15"
  },
  green: {
    100: "#E1F4E1",
    400: "#89D188",
    500: "#6CC66A",
    700: "#427940",
    850: "#224021"
  },
  lightBlue: {
    100: "#E1F5FE",
    400: "#89D9FC",
    500: "#6BCFFB",
    700: "#418DAF",
    850: "#215C76"
  },
  /* Italian public services (pagoPA, CIE, SPID…) */
  blueItalia: {
    50: "#DDEBFA",
    100: "#C4DCF5",
    300: "#4595E5",
    500: "#0066CC",
    600: "#0052A3",
    850: "#001F3D"
  }
});

/* Alphas a token color can take. `0` keeps the hue, so a transition to transparent doesn't pass through grey */
const opacityScale = [0, 0.1, 0.15, 0.2, 0.5, 0.6, 0.7, 0.85] as const;
export type IOOpacity = (typeof opacityScale)[number];

/* Named values of Figma `Color/Opacity`: each one a single value of the scale */
const namedOpacity = {
  /* Disabled elements, and disabled colors with `withAlpha` */
  disabled: 0.5
} as const satisfies Record<string, IOOpacity>;

/* The opacity ramp, and its named values */
export const IOOpacity = { scale: opacityScale, ...namedOpacity } as const;

declare const origin: unique symbol;

/* One of our colors: declared once, then referenced by name */
export type IOColorValue = IOCustomColor | IOPaletteColor | IOTranslucentColor;

/* A color outside the palette, declared in a module-level `…Colors` object */
export type IOCustomColor = `#${string}`;

/* Hex values the palette declares: alpha comes from `withAlpha` */
export type IOHexColors = {
  readonly [key: string]: `#${string}` | IOHexColors;
};

/* A color of `IOColorPalette` */
export type IOPaletteColor = IOColor<"palette">;

/* Same shape as `T`, every color tagged as `C` */
export type IOTaggedColors<T, C> = {
  readonly [K in keyof T]: T[K] extends string ? C : IOTaggedColors<T[K], C>;
};

/* A palette or custom color with an alpha from the scale: only `withAlpha` creates it */
export type IOTranslucentColor = IOColor<"translucent">;

/* A color string, tagged with where it was declared */
type IOColor<Origin extends string> = string & { readonly [origin]: Origin };
