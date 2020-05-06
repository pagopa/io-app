import { none, Option, some } from "fp-ts/lib/Option";
import { areSetEqual, areStringsEqual, maybeInnerProperty } from "../options";

describe("areSetEqual", () => {
  it("should return true for equal set of strings", () => {
    const setA: Option<Set<string>> = some(new Set(["1", "2", "3"]));
    const setB: Option<Set<string>> = some(new Set(["2", "3", "1"]));
    expect(areSetEqual(setA, setB)).toBeTruthy();
  });

  it("should return false for not equal set of strings", () => {
    const setA: Option<Set<string>> = some(new Set(["1", "2"]));
    const setB: Option<Set<string>> = some(new Set(["2", "3", "1"]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of strings", () => {
    const setA: Option<Set<string>> = some(new Set(["1", "2", "4"]));
    const setB: Option<Set<string>> = some(new Set(["1", "2"]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of numbers", () => {
    const setA: Option<Set<number>> = some(new Set([1, 2, 3]));
    const setB: Option<Set<number>> = some(new Set([1, 4]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of numbers", () => {
    const setA: Option<Set<number>> = some(new Set([1, 2, 3]));
    const setB: Option<Set<number>> = none;
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return true if none items are compared", () => {
    const setA: Option<Set<number>> = none;
    const setB: Option<Set<number>> = none;
    expect(areSetEqual(setA, setB)).toBeTruthy();
  });
});

describe("areStringEqual", () => {
  it("should return true if the strings are equal", () => {
    expect(areStringsEqual(some("ab"), some("ab"))).toBeTruthy();
  });

  it("should return true if both the strings has a different case and caseInsensitive is true", () => {
    expect(areStringsEqual(some("AA"), some("aa"), true)).toBeTruthy();
  });

  it("should return false if both the strings has a different case and caseInsensitive is not expressed", () => {
    expect(areStringsEqual(some("AA"), some("aa"))).toBeFalsy();
  });

  it("should return false if the strings are not equal", () => {
    expect(areStringsEqual(some("ab"), some("abc"), true)).toBeFalsy();
  });

  it("should return false if the first string is a segment of the second one", () => {
    expect(areStringsEqual(some("ab"), some("abc"))).toBeFalsy();
  });

  it("should return false if the second string is a segment of the first one", () => {
    expect(areStringsEqual(some("abc"), some("ab"))).toBeFalsy();
  });

  it("should return false if the strings are not equal", () => {
    expect(areStringsEqual(some("a"), some("bb"))).toBeFalsy();
  });

  it("should return true if strings are empty", () => {
    expect(areStringsEqual(some(""), some(""))).toBeTruthy();
  });

  it("should return false if the compared objects are none", () => {
    expect(areStringsEqual(none, none)).toBeFalsy();
  });

  it("should return false if at least one of the compared objects is none", () => {
    expect(areStringsEqual(none, some("a"))).toBeFalsy();
  });
});

describe("maybeInnerProperty", () => {
  it("should return the inner property", () => {
    const obj = {
      person: {
        name: "John"
      }
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n);
    expect(innerProp).toEqual(some("John"));
  });

  it("should return the inner property", () => {
    const obj = {
      person: {
        name: "John"
      }
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n + "salt");
    expect(innerProp).toEqual(some("Johnsalt"));
  });

  it("should return the none", () => {
    const obj = {
      person: {
        name: undefined
      }
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n);
    expect(innerProp).toEqual(none);
  });

  it("should return the none", () => {
    type Person = {
      person?: { name?: string };
    };
    const obj: Person = {
      person: undefined
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n);
    expect(innerProp).toEqual(none);
  });
});
