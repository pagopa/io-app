import { Platform } from "react-native";
import { fontWeightsMocks, italics } from "../__mock__/fontMocks";
import { FontStyle, fontWeights, makeFontStyleObject } from "../fonts";

jest.mock("react-native", () => ({
  // @ts-ignore
  Platform: { OS: "ios", select: obj => obj.ios }
}));

describe("makeFontStyleObject behaviour on iOS", () => {
  it("Platform set correctly to iOS", () => {
    expect(Platform.OS).toBe("ios");
  });
  it("call makeFontStyleObject without parameters should have default values", () => {
    const font = makeFontStyleObject();
    expect(font.fontFamily).toBe("Titillium Web");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBeUndefined();
  });
  it("default font family should be Titillium if specify the weight", () => {
    const font = makeFontStyleObject("Bold");
    expect(font.fontFamily).toBe("Titillium Web");
    expect(font.fontStyle).toBe(FontStyle.normal);
    expect(font.fontWeight).toBe("700");
  });
  it("TitilliumWeb, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw => {
        const font = makeFontStyleObject(fw, isItalic, "TitilliumWeb");
        expect(font.fontFamily).toBe(`Titillium Web`);
        expect(font.fontStyle).toBe(
          isItalic ? FontStyle.italic : FontStyle.normal
        );
        expect(font.fontWeight).toBe(fontWeights[fw]);
      })
    );
  });
  it("RobotoMono, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw => {
        const font = makeFontStyleObject(fw, isItalic, "RobotoMono");
        expect(font.fontFamily).toBe(`Roboto Mono`);
        expect(font.fontStyle).toBe(
          isItalic ? FontStyle.italic : FontStyle.normal
        );
        expect(font.fontWeight).toBe(fontWeights[fw]);
      })
    );
  });
});
