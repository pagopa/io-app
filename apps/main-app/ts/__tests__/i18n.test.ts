import I18n from "i18next";

import { itwBrandNoBreak } from "../i18n";

const WORD_JOINER = "⁠";
const ITW_BRAND_NO_BREAK = `IT-${WORD_JOINER}Wallet`;

describe("itwBrandNoBreak post-processor", () => {
  it.each([
    {
      name: "every brand name",
      value: "IT-Wallet e IT-Wallet",
      expected: `${ITW_BRAND_NO_BREAK} e ${ITW_BRAND_NO_BREAK}`
    },
    {
      name: "an already joined brand name",
      value: `Il tuo ${ITW_BRAND_NO_BREAK} ID`,
      expected: `Il tuo ${ITW_BRAND_NO_BREAK} ID`
    }
  ])("should handle $name", ({ value, expected }) => {
    expect(itwBrandNoBreak.process(value, "", {}, I18n)).toBe(expected);
  });
});
