import * as O from "fp-ts/lib/Option";
import { Locales } from "../../../locales/locales";
import { localeFallback, setLocale } from "../../i18n";
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
      expect(getLocalePrimary(input)).toStrictEqual(O.some(expected));
    });
  });
});

describe("getLocalePrimaryWithFallback", () => {
  [
    ["it", "it"],
    ["en", "en"],
    ["fr", localeFallback.locale],
    ["fr", "it"],
    ["somethingstrange", "it"]
  ].forEach(t => {
    const [locale, expected] = t;
    it(`getLocalePrimaryWithFallback should return ${expected} if locale is ${locale}`, () => {
      setLocale(locale as Locales);
      expect(getLocalePrimaryWithFallback()).toStrictEqual(expected);
    });
  });
});
