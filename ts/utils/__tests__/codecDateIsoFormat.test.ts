import { isRight } from "fp-ts/lib/Either";
import { DateFromISOString } from "../../utils/dates";

describe("should convert a ISO string into a date object and a date object into ISO string representation", () => {
  it("should convert a date in its ISO string representation", () => {
    const xmas = new Date(2019, 11, 25);
    expect(DateFromISOString.encode(xmas)).toBe("2019-12-24T23:00:00.000Z");
  });

  it("should convert a string representing a date in ISO format in the relative date object", () => {
    const xmas = "2019-12-24T23:00:00.000Z";
    const validation = DateFromISOString.decode(xmas);
    expect(isRight(validation)).toBeTruthy();
  });

  it("should fail to convert a string representing a wrong date in ISO format", () => {
    const xmas = "2019-32-24T23:00:00.000Z";
    const validation = DateFromISOString.decode(xmas);
    expect(isRight(validation)).toBeFalsy();
  });
});
