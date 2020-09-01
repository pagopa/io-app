import { some } from "fp-ts/lib/Option";
import { Locales } from "../../../locales/locales";
import { setLocale } from "../../i18n";
import { getLocalePrimary, getLocalePrimaryWithFallback } from "../locale";

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
