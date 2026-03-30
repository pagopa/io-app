import { debugInfoReplacer, truncateObjectStrings } from "../utils";

describe("truncateObjectStrings", () => {
  it.each`
    input                                              | maxLength | expected
    ${"Long string"}                                   | ${4}      | ${"Long..."}
    ${{ outer: { inner: "Long string" }, bool: true }} | ${4}      | ${{ outer: { inner: "Long..." }, bool: true }}
    ${["Long string", "Very long string"]}             | ${4}      | ${["Long...", "Very..."]}
    ${new Set(["Long string", "Very long string"])}    | ${4}      | ${["Long...", "Very..."]}
  `(
    "$input should be truncated to $expected",
    ({ input, maxLength, expected }) => {
      const result = truncateObjectStrings(input, maxLength);
      expect(result).toEqual(expected);
    }
  );
});

describe("debugInfoReplacer", () => {
  it("should serialize an Error into an object with name, message, and stack", () => {
    const error = new Error("something went wrong");
    const result = JSON.parse(JSON.stringify({ error }, debugInfoReplacer()));
    expect(result.error).toEqual({
      name: "Error",
      message: "something went wrong",
      stack: expect.any(String)
    });
  });

  it("should preserve a custom error name", () => {
    const error = new TypeError("bad type");
    const result = JSON.parse(JSON.stringify({ error }, debugInfoReplacer()));
    expect(result.error.name).toBe("TypeError");
    expect(result.error.message).toBe("bad type");
  });

  it("should return primitive values as-is when truncateStrings is false", () => {
    const input = { str: "hello", num: 42, bool: true, nil: null };
    const result = JSON.parse(
      JSON.stringify(input, debugInfoReplacer({ truncateStrings: false }))
    );
    expect(result).toEqual(input);
  });

  it("should not truncate strings when truncateStrings is false (default)", () => {
    const longString = "a".repeat(300);
    const result = JSON.parse(
      JSON.stringify({ value: longString }, debugInfoReplacer())
    );
    expect(result.value).toBe(longString);
  });

  it("should truncate strings when truncateStrings is true", () => {
    const longString = "a".repeat(300);
    const result = JSON.parse(
      JSON.stringify(
        { value: longString },
        debugInfoReplacer({ truncateStrings: true })
      )
    );
    expect(result.value).toBe("a".repeat(250) + "...");
  });

  it("should not truncate short strings when truncateStrings is true", () => {
    const result = JSON.parse(
      JSON.stringify(
        { value: "short" },
        debugInfoReplacer({ truncateStrings: true })
      )
    );
    expect(result.value).toBe("short");
  });

  it("should truncate strings in nested objects when truncateStrings is true", () => {
    const longString = "b".repeat(300);
    const input = { nested: { text: longString, count: 5 } };
    const result = JSON.parse(
      JSON.stringify(input, debugInfoReplacer({ truncateStrings: true }))
    );
    expect(result.nested.text).toBe("b".repeat(250) + "...");
    expect(result.nested.count).toBe(5);
  });
});
