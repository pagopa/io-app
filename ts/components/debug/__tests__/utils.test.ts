import { truncateObjectStrings } from "../utils";

describe("truncateObjectStrings", () => {
  it.each`
    input                                              | maxLength | expected
    ${"Long string"}                                   | ${4}      | ${"Long..."}
    ${{ outer: { inner: "Long string" }, bool: true }} | ${4}      | ${{ outer: { inner: "Long..." }, bool: true }}
    ${["Long string", "Very long string"]}             | ${4}      | ${["Long...", "Very..."]}
    ${new Set(["Long string", "Very long string"])}    | ${4}      | ${new Set(["Long...", "Very..."])}
  `("should truncate strings", ({ input, maxLength, expected }) => {
    const result = truncateObjectStrings(input, maxLength);
    expect(result).toEqual(expected);
  });
});
