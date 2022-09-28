import { getCgnUserAgeRange } from "../dates";

describe("getCgnUserAgeRange", () => {
  beforeAll(() => {
    // eslint-disable-next-line functional/immutable-data
    Date.now = jest.fn(() => new Date(Date.UTC(2022, 1, 1)).valueOf());
  });

  it.each([
    [undefined, "unrecognized"],
    [new Date("1991-01-06"), "31-35"],
    [new Date("1994-01-06"), "26-30"],
    [new Date("1999-01-06"), "18-25"],
    [new Date("2004-01-06"), "18-25"],
    [new Date("2006-01-06"), "unrecognized"]
  ])(
    "when the birthdate is $birthDate the range should be $ageRange",
    (birthDate, ageRange) => {
      expect(getCgnUserAgeRange(birthDate as Date | undefined)).toBe(ageRange);
    }
  );
});
