import { isValueNotFoundError } from "../secureStorage";

describe("SecureStorage", () => {
  describe("isValueNotFoundError", () => {
    test.each([
      [{ message: "VALUE_NOT_FOUND", userInfo: {} }, true],
      [{ message: "OTHER_ERROR", userInfo: {} }, false],
      ["string", false],
      [null, false],
      [undefined, false]
    ])("given %p as argument, returns %p", (error, result) => {
      expect(isValueNotFoundError(error)).toBe(result);
    });
  });
});
