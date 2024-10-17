import * as O from "fp-ts/lib/Option";
import {
  addEvery,
  capitalize,
  isStringNullyOrEmpty,
  maybeNotNullyString,
  formatBytesWithUnit,
  capitalizeTextName
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

describe("formatBytesWithUnit", () => {
  it("should format bytes with the correct unit (B)", () => {
    expect(formatBytesWithUnit(505)).toEqual("505 B");
  });

  it("should format bytes with the correct unit (KB)", () => {
    expect(formatBytesWithUnit(1000)).toEqual("1 KB");
  });

  it("should format bytes with the correct unit (MB)", () => {
    expect(formatBytesWithUnit(1048576)).toEqual("1 MB");
  });

  it("should format bytes with the correct unit (GB)", () => {
    expect(formatBytesWithUnit(1733741824)).toEqual("1.7 GB");
  });

  it("should format bytes with the correct unit (TB)", () => {
    expect(formatBytesWithUnit(1345001000200123)).toEqual("1.3 TB");
  });

  it("should format bytes with the correct unit (B)", () => {
    expect(formatBytesWithUnit(0)).toEqual("0 B");
  });

  it("should format bytes with the correct unit (B) when providing NaN", () => {
    expect(formatBytesWithUnit(NaN)).toEqual("0 B");
  });

  it("should format bytes with the correct unit (B) when providing a negative number", () => {
    expect(formatBytesWithUnit(-1234)).toEqual("0 B");
  });
});

describe("capitalizeTextName", () => {
  it("should return a string where each word has the first char in uppercase", () => {
    expect(capitalizeTextName("capitalize")).toEqual("Capitalize");
  });

  it("should return a string where each word has the first char in uppercase even after an apostrophe", () => {
    expect(capitalizeTextName("Capit'Alize")).toEqual("Capit'Alize");
  });

  it("should return a string where each word has the first char in uppercase even after an apostrophe-2", () => {
    expect(capitalizeTextName("capit'alize")).toEqual("Capit'Alize");
  });

  it("should return a string where each word has the first char in uppercase even after an apostrophe-3", () => {
    expect(capitalizeTextName("Capit'alize")).toEqual("Capit'Alize");
  });

  it("should return a string where each word has the first char in uppercase even after an apostrophe-4", () => {
    expect(capitalizeTextName("capit'Alize")).toEqual("Capit'Alize");
  });

  it("should return a string where each word has the first char in uppercase even after an apostrophe-5", () => {
    expect(capitalizeTextName("CAPIT'ALIZE")).toEqual("Capit'Alize");
  });
});
