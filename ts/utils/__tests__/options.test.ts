import { none, Option, some } from "fp-ts/lib/Option";
import { areSetEqual } from "../options";

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
