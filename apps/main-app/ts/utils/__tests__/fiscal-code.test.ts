/**
 * @jest-environment ./jest/TimezoneEnvironment.js
 * @jest-environment-options {"timezone": "America/New_York"}
 */
import { availableTranslations, setLocale } from "../../i18n";
import { formatFiscalCodeBirthdayAsShortFormat } from "../dates";

/**
 * The suite is pinned to a negative-offset zone on purpose: the birth date is
 * stored as UTC midnight, so in `America/New_York` the *local* calendar day is
 * the 21st while the correct rendered value is the 22nd. Reading the date with
 * local getters instead of UTC ones therefore fails here, which is the
 * regression this suite guards (IABT-1403). Under `UTC` — the default for the
 * rest of the suite — both readings agree and the bug would slip through.
 */
const PINNED_TIMEZONE = "America/New_York";

const BIRTH_DATE = new Date("1977-05-22T00:00:00.000Z");
const EXPECTED_BIRTHDAY = "22/05/1977";

describe("formatFiscalCodeBirthdayAsShortFormat", () => {
  it("runs in the pinned timezone", () => {
    // Guards against the custom environment silently not being applied, which
    // would make the assertions below pass for the wrong reason.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      PINNED_TIMEZONE
    );
    expect(BIRTH_DATE.getDate()).not.toBe(BIRTH_DATE.getUTCDate());
  });

  // Driven by the shipped locale resources so a newly added language is
  // covered automatically instead of silently skipped.
  test.each(availableTranslations)(
    "renders the UTC calendar day with locale %s",
    locale => {
      setLocale(locale);
      expect(formatFiscalCodeBirthdayAsShortFormat(BIRTH_DATE)).toBe(
        EXPECTED_BIRTHDAY
      );
    }
  );
});
