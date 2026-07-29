import { makeFontStyleObject } from "@io-app/design-system";
import { Platform } from "react-native";

import { fontWeightsMocks, italics } from "../__mock__/fontMocks";
import { FontStyle, fontWeights } from "../fonts";

jest.mock("react-native", () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Platform: { OS: "ios", select: obj => obj.ios }
}));

describe("makeFontStyleObject behavior on iOS", () => {
  it("Platform set correctly to iOS", () => {
    expect(Platform.OS).toBe("ios");
  });
  it("call makeFontStyleObject without parameters should have default values", () => {
    const font = makeFontStyleObject(undefined, undefined, undefined);
    expect(font.fontFamily).toBe("Titillium Sans Pro");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBe("400");
  });
  it("default font family should be Titillium if specifying the weight", () => {
    const font = makeFontStyleObject(undefined, undefined, undefined, "Bold");
    expect(font.fontFamily).toBe("Titillium Sans Pro");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBe("700");
  });
  it("TitilliumSansPro, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw => {
        const font = makeFontStyleObject(
          undefined,
          "TitilliumSansPro",
          undefined,
          fw,
          isItalic ? FontStyle.italic : FontStyle.normal
        );
        expect(font.fontFamily).toBe(`Titillium Sans Pro`);
        expect(font.fontStyle).toBe(
          isItalic ? FontStyle.italic : FontStyle.normal
        );
        expect(font.fontWeight).toBe(fontWeights[fw]);
      })
    );
  });
});
