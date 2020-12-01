import { some } from "fp-ts/lib/Option";
import { Locales } from "../../../locales/locales";
import { setLocale } from "../../i18n";
import {
  getLocalePrimary,
  getLocalePrimaryWithFallback,
  localeDateFormat
} from "../locale";

describe("getLocalePrimary", () => {
  [
    ["it-IT", "it"],
    ["it-US", "it"],
    ["en-EN", "en"],
    ["it", "it"]
  ].forEach(t => {
    const [input, expected] = t;
    it("getLocalePrimary should return the expected output", () => {
      expect(getLocalePrimary(input)).toStrictEqual(some(expected));
    });
  });
});

describe("getLocalePrimaryWithFallback", () => {
  [
    ["it", "it", "en"],
    ["en", "en", "en"],
    ["fr", "en", "en"],
    ["fr", "it", "it"],
    ["somethingstrange", "en"]
  ].forEach(t => {
    const [locale, expected, fallback] = t;
    it("getLocalePrimaryWithFallback should return it", () => {
      setLocale(locale as Locales);
      expect(getLocalePrimaryWithFallback(fallback as Locales)).toStrictEqual(
        expected
      );
    });
  });
});

describe("localeDateFormat on locale", () => {
  const date = new Date("May 17, 1995 03:24:00");
  const invalidDate = new Date("?");

  [
    ["%d/%m/%Y", "17/05/1995", "17/05/1995"],
    ["%d %b %Y", "17 Mag 1995", "17 May 1995"],
    ["%d %b %Y, %H:%M", "17 Mag 1995, 03:24", "17 May 1995, 03:24"],
    ["%d %B %Y", "17 Maggio 1995", "17 May 1995"],
    ["%B", "Maggio", "May"],
    ["%B %Y", "Maggio 1995", "May 1995"],
    ["%d %b, %H:%M", "17 Mag, 03:24", "17 May, 03:24"],
    ["%d %B", "17 Maggio", "17 May"],
    ["%m/%Y", "05/1995", "05/1995"]
  ].forEach(elem => {
    const [dateFormat, expectedIT, expectedEN] = elem;
    it("convert given date to string format on IT locale", () => {
      setLocale("it" as Locales);
      expect(localeDateFormat(date, dateFormat)).toStrictEqual(expectedIT);
      setLocale("en" as Locales);
      expect(localeDateFormat(date, dateFormat)).toStrictEqual(expectedEN);
    });
  });

  it("invalid date converts in common date error string", () => {
    setLocale("it" as Locales);
    expect(localeDateFormat(invalidDate, "%d/%m/%Y")).toStrictEqual(
      "data non valida"
    );
    setLocale("en" as Locales);
    expect(localeDateFormat(invalidDate, "%B")).toStrictEqual("invalid date");
  });
});
