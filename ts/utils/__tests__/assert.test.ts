import { assert } from "../assert";

describe("Test assert function", () => {
  it("Asserts a true condition", () => {
    expect(() => assert(2 + 2 === 4)).not.toThrow();
  });

  it("Asserts a truthy condition", () => {
    expect(() => assert({})).not.toThrow();
  });

  it("Asserts a false condition with no message", () => {
    expect(() => assert(4 + 2 === 5)).toThrow("Assertion failed");
  });

  it("Asserts a falsy condition with a custom message", () => {
    expect(() => assert(null, "You null not pass")).toThrow(
      "You null not pass"
    );
  });
});
