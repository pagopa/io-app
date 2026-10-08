import * as Typography from "../../components/typography";
import { IOTypographicStyle, IOTypography } from "../IOTypography";

/* Widened to `IOTypographicStyle`: `as const` narrows each entry to its own
   literal shape, where the optional attributes are simply absent */
const entries = Object.entries(IOTypography) as ReadonlyArray<
  [IOTypography, IOTypographicStyle]
>;

describe("IOTypography", () => {
  it.each(entries)("%s never sets a line height below its size", (_, style) => {
    if (style.lineHeight !== undefined) {
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.size);
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
