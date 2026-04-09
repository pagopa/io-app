import MockDate from "mockdate";
import { getCgnUserAgeRange } from "../dates";

describe("getCgnUserAgeRange", () => {
  beforeAll(() => {
    MockDate.set("2022-01-01");
  });

  it.each([
    [undefined, "unrecognized"],
    [new Date("1991-01-01"), "31-35"],
    // Birthdate is 6th Jan, so the user is still 30 years old on 1st Jan
    [new Date("1991-01-06"), "26-30"],
    [new Date("1994-01-06"), "26-30"],
    [new Date("1999-01-06"), "18-25"],
    [new Date("2004-01-01"), "18-25"],
    // Birthdate is 6th Jan, so the user is still 17 years old on 1st Jan
    [new Date("2004-01-06"), "unrecognized"],
    [new Date("2006-01-06"), "unrecognized"]
  ])(
    "when the birthdate is $birthDate the range should be $ageRange",
    (birthDate, ageRange) => {
      expect(getCgnUserAgeRange(birthDate)).toBe(ageRange);
    }
  );
});
