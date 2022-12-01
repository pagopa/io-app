import { Locales } from "../../../locales/locales";
import { setLocale } from "../../i18n";
import {
  formatFiscalCodeBirthdayAsShortFormat,
  formatFiscalCodeBirthdayAsAccessibilityReadableFormat
} from "../dates";

// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
describe("Check fiscal code date", () => {
  it("IT", () => {
    const timeZone = "Europe/Rome";
    testFiscalCodeByLocale("it", timeZone);
    testFiscalCodeByLocale("en", timeZone);
  });

  it("NY", () => {
    const timeZone = "America/New_York";
    testFiscalCodeByLocale("it", timeZone);
    testFiscalCodeByLocale("en", timeZone);
  });

  it("AU", () => {
    const timeZone = "Australia/Sydney";
    testFiscalCodeByLocale("it", timeZone);
    testFiscalCodeByLocale("en", timeZone);
  });

  it("CA", () => {
    const timeZone = "America/Whitehorse";
    testFiscalCodeByLocale("it", timeZone);
    testFiscalCodeByLocale("en", timeZone);
  });
});

const testFiscalCodeByLocale = (locale: Locales, timeZone: string) => {
  setLocale(locale);
  // set environment variable TZ from command line
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  expect(timezone).toBe(timeZone);
  const testDate = new Date("1977-05-22T00:00:00.000Z");
  const checkDate = formatFiscalCodeBirthdayAsShortFormat(testDate!);
  const checkDateForAccessibility =
    formatFiscalCodeBirthdayAsAccessibilityReadableFormat(testDate!);
  const dayName = locale === "it" ? "domenica" : "Sunday";
  const monthName = locale === "it" ? "maggio" : "May";
  expect(`${dayName} 22 ${monthName} 1977`).toBe(checkDateForAccessibility);
  expect("22/05/1977").toBe(checkDate);
};
