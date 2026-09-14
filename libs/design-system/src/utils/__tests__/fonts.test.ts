import { makeFontPostScriptName } from "../fonts";

describe("makeFontPostScriptName", () => {
  const scenarios = [
    {
      expected: "Titillio-Semibold",
      font: "Titillio",
      fontStyle: undefined,
      name: "spells the face name out for Titillio",
      weight: "Semibold"
    },
    {
      expected: "TitilliumSansPro-Sbd",
      font: "TitilliumSansPro",
      fontStyle: undefined,
      name: "abbreviates the face name for TitilliumSansPro",
      weight: "Semibold"
    },
    {
      expected: "TitilliumSansPro-It",
      font: "TitilliumSansPro",
      fontStyle: "italic",
      name: "drops the weight from the italic regular TitilliumSansPro face",
      weight: "Regular"
    },
    {
      expected: "Titillio-SemiboldItalic",
      font: "Titillio",
      fontStyle: "italic",
      name: "appends the italic suffix for Titillio",
      weight: "Semibold"
    },
    {
      expected: "Titillio-Regular",
      font: "Titillio",
      fontStyle: undefined,
      name: "falls back to Regular for the missing Medium face",
      weight: "Medium"
    },
    {
      expected: "TitilliumSansPro-Rg",
      font: "TitilliumSansPro",
      fontStyle: undefined,
      name: "shares the Regular face for the missing Medium TitilliumSansPro one",
      weight: "Medium"
    },
    {
      expected: "FiraCode-Medium",
      font: "FiraCode",
      fontStyle: undefined,
      name: "always resolves the only FiraCode face",
      weight: "Bold"
    }
  ] as const;

  test.each(scenarios)("$name", ({ expected, font, fontStyle, weight }) => {
    expect(makeFontPostScriptName(font, weight, fontStyle)).toBe(expected);
  });

  it("defaults to the regular upright face", () => {
    expect(makeFontPostScriptName("Titillio")).toBe("Titillio-Regular");
  });
});
