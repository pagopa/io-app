import * as O from "fp-ts/lib/Option";
import { preferredLanguageToString } from "..";
import { Locales } from "../../../../../../locales/locales";

describe("preferredLanguageToString", () => {
  it("Should return 'it' for 'O.none'", () => {
    const preferredLanguage = preferredLanguageToString(O.none);
    expect(preferredLanguage).toBe("it");
  });
  const locales: Array<Locales> = ["en", "it", "de"];
  locales.forEach(locale => {
    it(`Given an input 'O.some(${locale})', it should return '${locale}'`, () => {
      const localeMaybe = O.some(locale);
      const preferredLanguage = preferredLanguageToString(localeMaybe);
      expect(preferredLanguage).toBe(locale);
    });
  });
});
