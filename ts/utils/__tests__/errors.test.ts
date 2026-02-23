import { getError } from "../errors";

describe("getError", () => {
  it("should return the same Error instance when given an Error", () => {
    const error = new Error("test error");
    const result = getError(error);
    expect(result).toBe(error);
    expect(result.message).toBe("test error");
  });

  it("should wrap a string primitive into an Error", () => {
    const result = getError("string error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("string error");
  });

  it("should wrap a String object into an Error", () => {
    // eslint-disable-next-line no-new-wrappers
    const result = getError(new String("boxed string error"));
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("boxed string error");
  });

  it("should return Error('unknown') for undefined", () => {
    const result = getError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("unknown");
  });

  it("should return Error('unknown') for null", () => {
    const result = getError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("unknown");
  });

  it("should return Error('unknown') for a number", () => {
    const result = getError(42);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("unknown");
  });

  it("should return Error('unknown') for a plain object", () => {
    const result = getError({ message: "not an error" });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("unknown");
  });

  it("should wrap an empty string into an Error", () => {
    const result = getError("");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("");
  });
});
