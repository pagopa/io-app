import * as O from "fp-ts/lib/Option";
import {
  addEvery,
  capitalize,
  isStringNullyOrEmpty,
  maybeNotNullyString
} from "../strings";

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

describe("isStringNullyOrEmpty", () => {
  it("should return true", () => {
    expect(isStringNullyOrEmpty(undefined)).toBeTruthy();
  });

  it("should return false", () => {
    expect(isStringNullyOrEmpty("hello")).toBeFalsy();
  });

  it("should return true", () => {
    expect(isStringNullyOrEmpty("    ")).toBeTruthy();
  });

  it("should return true", () => {
    expect(isStringNullyOrEmpty("")).toBeTruthy();
  });

  it("should return true", () => {
    expect(isStringNullyOrEmpty(null)).toBeTruthy();
  });
});

describe("maybeNotNullyString", () => {
  it("should return none", () => {
    expect(maybeNotNullyString(undefined)).toEqual(O.none);
  });

  it("should return some", () => {
    expect(maybeNotNullyString("hello")).toEqual(O.some("hello"));
  });

  it("should return none", () => {
    expect(maybeNotNullyString("    ")).toEqual(O.none);
  });

  it("should return none", () => {
    expect(maybeNotNullyString("")).toEqual(O.none);
  });

  it("should return none", () => {
    expect(maybeNotNullyString(null)).toEqual(O.none);
  });
});

describe("addEvery", () => {
  it("should return the same string", () => {
    expect(addEvery("hi", "world", 4)).toEqual("hi");
  });

  it("should add a * every 2 chars", () => {
    expect(addEvery("hello", "*", 1)).toEqual("h*e*l*l*o*");
  });
});
