import { Platform } from "react-native";
import { fontWeightsMocks, italics } from "../__mock__/fontMocks";
import { makeFontStyleObject } from "../fonts";

jest.mock("react-native", () => ({
  // @ts-ignore
  Platform: { OS: "android", select: obj => obj.android }
}));

describe("makeFontStyleObject behaviour on Android", () => {
  it("Platform set correctly to Android", () => {
    expect(Platform.OS).toBe("android");
  });
  it("fontWeight and fontStyle should be undefined", () => {
    const font = makeFontStyleObject();
    expect(font.fontStyle).toBeUndefined();
    expect(font.fontWeight).toBeUndefined();
  });
  it("default font family should be Titillium if specify the weight", () => {
    const font = makeFontStyleObject("Bold");
    expect(font.fontFamily).toBe("TitilliumWeb-Bold");
    expect(font.fontStyle).toBeUndefined();
    expect(font.fontWeight).toBeUndefined();
  });
  it("TitilliumWeb, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw =>
        expect(
          makeFontStyleObject(fw, isItalic, "TitilliumWeb").fontFamily
        ).toBe(`TitilliumWeb-${fw}${isItalic ? "Italic" : ""}`)
      )
    );
  });
  it("RobotoMono, all weight", () => {
    italics.map(isItalic =>
      fontWeightsMocks.map(fw =>
        expect(makeFontStyleObject(fw, isItalic, "RobotoMono").fontFamily).toBe(
          `RobotoMono-${fw}${isItalic ? "Italic" : ""}`
        )
      )
    );
  });
});
