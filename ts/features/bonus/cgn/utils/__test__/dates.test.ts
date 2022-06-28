import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { getCgnUserAgeRange } from "../dates";

describe("getCgnUserAgeRange", () => {
  beforeAll(() => {
    // eslint-disable-next-line functional/immutable-data
    Date.now = jest.fn(() => new Date(Date.UTC(2022, 1, 1)).valueOf());
  });

  it.each([
    [undefined, "unrecognized"],
    [DateFromString.decode("1991-01-06").value as Date, "31-35"],
    [DateFromString.decode("1994-01-06").value as Date, "26-30"],
    [DateFromString.decode("1999-01-06").value as Date, "18-25"]
  ])(
    "when the birthdate is $birthDate the range should be $ageRange",
    (birthDate, ageRange) => {
      expect(getCgnUserAgeRange(birthDate as Date | undefined)).toBe(ageRange);
    }
  );
});
