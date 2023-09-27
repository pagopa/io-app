import { formatNumberCurrencyOrDefault } from "../strings";

describe("test formatNumberCurrencyOrDefault", () => {
  it("returns the default value if input is undefined", () => {
    const defaultValue = "default";
    const result = formatNumberCurrencyOrDefault(undefined, defaultValue);
    expect(result).toStrictEqual(defaultValue);
  });
  it("returns the formatted currenct if input is a valid number", () => {
    const result = formatNumberCurrencyOrDefault(99.56);
    expect(result).toStrictEqual("99.56 €");
  });
});
