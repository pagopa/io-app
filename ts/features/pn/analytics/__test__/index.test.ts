import { booleanOrUndefinedToPNServiceStatus } from "..";

describe("index", () => {
  describe("booleanOrUndefinedToPNServiceStatus", () => {
    (
      [
        [undefined, "unknown"],
        [false, "not_active"],
        [true, "active"]
      ] as const
    ).forEach(([input, expectedOutput]) => {
      it(`should return '${expectedOutput}' for '${input}'`, () => {
        const output = booleanOrUndefinedToPNServiceStatus(input);
        expect(output).toBe(expectedOutput);
      });
    });
  });
});
