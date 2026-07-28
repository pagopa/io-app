/**
 * @jest-environment ./jest/TimezoneEnvironment.js
 * @jest-environment-options {"timezone": "America/New_York"}
 */
import i18next from "i18next";

import { availableTranslations, setLocale } from "../../i18n";
import { formatFiscalCodeBirthdayAsShortFormat } from "../dates";

// Pinned to a negative-offset zone: the birth date is UTC midnight, so reading
// it with local getters yields the 21st instead of the 22nd (IABT-1403). Under
// UTC, the default elsewhere, that bug is invisible.
const PINNED_TIMEZONE = "America/New_York";

const BIRTH_DATE = new Date("1977-05-22T00:00:00.000Z");
const EXPECTED_BIRTHDAY = "22/05/1977";
const INVALID_DATE_KEY = "global.date.invalid";

const invalidDateLabel = (locale: (typeof availableTranslations)[number]) =>
  i18next.getFixedT(locale)(INVALID_DATE_KEY);

describe("formatFiscalCodeBirthdayAsShortFormat", () => {
  it("runs in the pinned timezone", () => {
    // Without this the assertions below could pass for the wrong reason.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      PINNED_TIMEZONE
    );
    expect(BIRTH_DATE.getDate()).not.toBe(BIRTH_DATE.getUTCDate());
  });

  it("renders the UTC calendar day rather than the local one", () => {
    expect(formatFiscalCodeBirthdayAsShortFormat(BIRTH_DATE)).toBe(
      EXPECTED_BIRTHDAY
    );
  });

  describe("when the date is not valid", () => {
    it("has a distinct label per locale", () => {
      const labels = availableTranslations.map(invalidDateLabel);
      expect(new Set(labels).size).toBe(availableTranslations.length);
    });

    // The only locale-dependent branch: a valid date uses a plain dd/MM/yyyy
    // template. Driven by the shipped resources so new languages are covered.
    test.each(availableTranslations)(
      "returns the label of the active locale %s",
      locale => {
        setLocale(locale);
        expect(formatFiscalCodeBirthdayAsShortFormat(new Date("nope"))).toBe(
          invalidDateLabel(locale)
        );
      }
    );
  });
});
