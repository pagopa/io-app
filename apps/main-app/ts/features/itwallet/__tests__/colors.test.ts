import { IOColors } from "@io-app/design-system";

import { itwColors } from "../colors";

describe("itwColors", () => {
  const light = itwColors(IOColors.light, "light");
  const dark = itwColors(IOColors.dark, "dark");

  it.each(["skeumorphicCard", "fiscalCode"] as const)(
    "should render the %s replica the same in both modes",
    key => expect(dark[key]).toEqual(light[key])
  );
});
