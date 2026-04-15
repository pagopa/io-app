import * as O from "fp-ts/lib/Option";
import { areSetEqual, areStringsEqual, maybeInnerProperty } from "../options";

describe("areSetEqual", () => {
  it("should return true for equal set of strings", () => {
    const setA: O.Option<Set<string>> = O.some(new Set(["1", "2", "3"]));
    const setB: O.Option<Set<string>> = O.some(new Set(["2", "3", "1"]));
    expect(areSetEqual(setA, setB)).toBeTruthy();
  });

  it("should return false for not equal set of strings", () => {
    const setA: O.Option<Set<string>> = O.some(new Set(["1", "2"]));
    const setB: O.Option<Set<string>> = O.some(new Set(["2", "3", "1"]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of strings", () => {
    const setA: O.Option<Set<string>> = O.some(new Set(["1", "2", "4"]));
    const setB: O.Option<Set<string>> = O.some(new Set(["1", "2"]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of numbers", () => {
    const setA: O.Option<Set<number>> = O.some(new Set([1, 2, 3]));
    const setB: O.Option<Set<number>> = O.some(new Set([1, 4]));
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return false for not equal set of numbers", () => {
    const setA: O.Option<Set<number>> = O.some(new Set([1, 2, 3]));
    const setB: O.Option<Set<number>> = O.none;
    expect(areSetEqual(setA, setB)).toBeFalsy();
  });

  it("should return true if none items are compared", () => {
    const setA: O.Option<Set<number>> = O.none;
    const setB: O.Option<Set<number>> = O.none;
    expect(areSetEqual(setA, setB)).toBeTruthy();
  });
});

describe("areStringEqual", () => {
  it("should return true if the strings are equal", () => {
    expect(areStringsEqual(O.some("ab"), O.some("ab"))).toBeTruthy();
  });

  it("should return true if both the strings has a different case and caseInsensitive is true", () => {
    expect(areStringsEqual(O.some("AA"), O.some("aa"), true)).toBeTruthy();
  });

  it("should return false if both the strings has a different case and caseInsensitive is not expressed", () => {
    expect(areStringsEqual(O.some("AA"), O.some("aa"))).toBeFalsy();
  });

  it("should return false if the strings are not equal", () => {
    expect(areStringsEqual(O.some("ab"), O.some("abc"), true)).toBeFalsy();
  });

  it("should return false if the first string is a segment of the second one", () => {
    expect(areStringsEqual(O.some("ab"), O.some("abc"))).toBeFalsy();
  });

  it("should return false if the second string is a segment of the first one", () => {
    expect(areStringsEqual(O.some("abc"), O.some("ab"))).toBeFalsy();
  });

  it("should return false if the strings are not equal", () => {
    expect(areStringsEqual(O.some("a"), O.some("bb"))).toBeFalsy();
  });

  it("should return true if strings are empty", () => {
    expect(areStringsEqual(O.some(""), O.some(""))).toBeTruthy();
  });

  it("should return false if the compared objects are none", () => {
    expect(areStringsEqual(O.none, O.none)).toBeFalsy();
  });

  it("should return false if at least one of the compared objects is none", () => {
    expect(areStringsEqual(O.none, O.some("a"))).toBeFalsy();
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
    expect(innerProp).toEqual(O.some("John"));
  });

  it("should return the inner property", () => {
    const obj = {
      person: {
        name: "John"
      }
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n + "salt");
    expect(innerProp).toEqual(O.some("Johnsalt"));
  });

  it("should return the O.none", () => {
    const obj = {
      person: {
        name: undefined
      }
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n);
    expect(innerProp).toEqual(O.none);
  });

  it("should return the O.none", () => {
    type Person = {
      person?: { name?: string };
    };
    const obj: Person = {
      person: undefined
    };
    const innerProp = maybeInnerProperty(obj.person, "name", n => n);
    expect(innerProp).toEqual(O.none);
  });
});
