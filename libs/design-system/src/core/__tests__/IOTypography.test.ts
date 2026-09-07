import * as Typography from "../../components/typography";
import { IOFontSize, IOFontWeight } from "../../utils/fonts";
import { IOThemeLight } from "../IOColors";
import { IOTypographicStyle, IOTypography } from "../IOTypography";

/* Widened to `IOTypographicStyle`: `as const` narrows each entry to its own
   literal shape, where the optional attributes are simply absent */
const entries = Object.entries(IOTypography) as ReadonlyArray<
  [IOTypography, IOTypographicStyle]
>;

/* Kept in sync by hand: it's the list the `IOFontSize` scale is built from,
   so deriving it from the same tuple would make the assertion tautological */
const fontSizeScale: ReadonlyArray<IOFontSize> = [
  12, 14, 16, 17, 18, 20, 22, 26, 28, 31, 32, 35
];

const fontWeights: ReadonlyArray<IOFontWeight> = [
  "Thin",
  "Light",
  "Regular",
  "Medium",
  "Semibold",
  "Bold",
  "Black"
];

describe("IOTypography", () => {
  it.each(entries)("%s sits on the font size scale", (_, style) => {
    expect(fontSizeScale).toContain(style.size);
  });

  it.each(entries)("%s declares a known font weight", (_, style) => {
    expect(fontWeights).toContain(style.weight);
  });

  it.each(entries)("%s never sets a line height below its size", (_, style) => {
    if (style.lineHeight !== undefined) {
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.size);
    }
  });

  it.each(entries)("%s resolves its chromatic default", (_, style) => {
    if (style.colorToken !== undefined) {
      expect(IOThemeLight).toHaveProperty(style.colorToken);
    }
  });

  it("exposes a style for every typographic component", () => {
    const componentNames = Object.keys(IOTypography).map(
      name => name.charAt(0).toUpperCase() + name.slice(1)
    );

    expect(Object.keys(Typography)).toEqual(
      expect.arrayContaining(componentNames)
    );
  });
});
