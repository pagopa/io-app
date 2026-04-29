import { getError, unknownToString } from "../errors";

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

describe("unknownToString", () => {
  it("should serialize null and undefined explicitly", () => {
    expect(unknownToString(null)).toBe("null");
    expect(unknownToString(undefined)).toBe("undefined");
  });

  it("should return the original string for string primitives", () => {
    expect(unknownToString("test string")).toBe("test string");
  });

  it("should serialize symbol primitives", () => {
    expect(unknownToString(Symbol("test"))).toBe("Symbol(test)");
  });

  it("should serialize functions with their name", () => {
    function namedFunction() {
      return undefined;
    }

    expect(unknownToString(namedFunction)).toBe("function: namedFunction");
  });

  it("should serialize errors using their stack when it already contains the message", () => {
    const error = new Error("boom");
    const result = unknownToString(error);

    expect(result).toContain("boom");
    expect(result).toContain("Error");
  });

  it("should prepend header when stack does not include the error message", () => {
    const error = Object.create(Error.prototype, {
      message: { value: "boom" },
      name: { value: "Error" },
      stack: { value: "custom-stack" }
    }) as Error;

    expect(unknownToString(error)).toBe(
      `${error.name}: ${error.message}\ncustom-stack`
    );
  });

  it("should serialize objects and handle bigint and symbol values", () => {
    const result = unknownToString({
      bigintValue: BigInt(42),
      symbolValue: Symbol("value")
    });

    expect(result).toBe('{"bigintValue":"42n","symbolValue":"Symbol(value)"}');
  });

  it("should return an unserializable marker for circular objects", () => {
    const circular: { readonly self: unknown } = {
      get self() {
        return circular;
      }
    };

    expect(unknownToString(circular)).toBe("[Unserializable Object]");
  });
});
