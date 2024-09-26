import { trimAndLimitValue } from "..";

describe("trimAndLimitValue", () => {
  it("should remove all spaces from the string", () => {
    const input = "a b c d e";
    const result = trimAndLimitValue(input, 10);
    expect(result).toBe("abcde");
  });

  it("should limit the string to the maximum length", () => {
    const input = "abcdefghij";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("abcde");
  });

  it("should return the string as is if under the maximum length", () => {
    const input = "abcde";
    const result = trimAndLimitValue(input, 10);
    expect(result).toBe("abcde");
  });

  it("should both trim spaces and limit the string to the maximum length", () => {
    const input = "a b c d e f g";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("abcde");
  });

  it("should return an empty string when input is an empty string", () => {
    const input = "";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("");
  });

  it("should handle strings with only spaces", () => {
    const input = "     ";
    const result = trimAndLimitValue(input, 5);
    expect(result).toBe("");
  });
});
