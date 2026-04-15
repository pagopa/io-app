import { Platform } from "react-native";
import { fontWeightsMocks, italics } from "../__mock__/fontMocks";
import { FontStyle, fontWeights, makeFontStyleObject } from "../fonts";

jest.mock("react-native", () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Platform: { OS: "ios", select: obj => obj.ios }
}));

describe("makeFontStyleObject behaviour on iOS", () => {
  it("Platform set correctly to iOS", () => {
    expect(Platform.OS).toBe("ios");
  });
  it("call makeFontStyleObject without parameters should have default values", () => {
    const font = makeFontStyleObject();
    expect(font.fontFamily).toBe("Titillium Sans Pro");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBeUndefined();
  });
  it("default font family should be Titillium if specify the weight", () => {
    const font = makeFontStyleObject("Bold");
    expect(font.fontFamily).toBe("Titillium Sans Pro");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBe("700");
  });
  it("TitilliumSansPro, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw => {
        const font = makeFontStyleObject(fw, isItalic, "TitilliumSansPro");
        expect(font.fontFamily).toBe(`Titillium Sans Pro`);
        expect(font.fontStyle).toBe(
          isItalic ? FontStyle.italic : FontStyle.normal
        );
        expect(font.fontWeight).toBe(fontWeights[fw]);
      })
    );
  });
});
