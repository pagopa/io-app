import { capitalize, isNullyOrEmpty } from "../strings";

describe("capitalize", () => {
  it("should return a string where each word has first char in uppercase-1", () => {
    expect(capitalize("hello world")).toEqual("Hello World");
  });

  it("should return a string where each word has first char in uppercase-2", () => {
    expect(capitalize("Hello World")).toEqual("Hello World");
  });

  it("should return a string where each word has first char in uppercase-3", () => {
    expect(capitalize("Hello world   ")).toEqual("Hello World   ");
  });

  it("should return a string where each word has first char in uppercase-4", () => {
    expect(capitalize("hello   world   ", "   ")).toEqual("Hello   World   ");
  });

  it("should return a string where each word has first char in uppercase-5", () => {
    expect(capitalize("   hello,world   ", ",")).toEqual("   Hello,World   ");
  });
});

describe("null or empty", () => {
  it("should return true", () => {
    expect(isNullyOrEmpty(undefined)).toBeTruthy();
  });

  it("should return false", () => {
    expect(isNullyOrEmpty("hello")).toBeFalsy();
  });

  it("should return true", () => {
    expect(isNullyOrEmpty("    ")).toBeTruthy();
  });

  it("should return true", () => {
    expect(isNullyOrEmpty("")).toBeTruthy();
  });

  it("should return true", () => {
    expect(isNullyOrEmpty(null)).toBeTruthy();
  });
});
