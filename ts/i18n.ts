import I18n from "react-native-i18n";

// If the following import is missing, generate it by running:
// npm run generate:locales
import * as locales from "../locales/locales";

// Should the app fallback to English if user locale doesn't exists
// tslint:disable-next-line:no-object-mutation
I18n.fallbacks = true;

// Define the supported translations
// tslint:disable-next-line:no-object-mutation
I18n.translations = {
  en: locales.localeEN,
  it: locales.localeIT
};

type TranslateT = {
  // allow unsafe translations only when a defaultValue gets passed
  (scope: string, options: { defaultValue: string }): string;
  // or else, the lookup must be safe
  (scope: locales.TranslationKeys, options?: I18n.TranslateOptions): string;
};

/**
 * Replacement for the I18n type for making the
 *
 * We can't simply add our definition for "t" as it will be
 * merged with the existing one (overloaded) keeping it unsafe by
 * making it accept any key.
 */
interface TypedI18n {
  readonly t: TranslateT;
  readonly translate: TranslateT;
  readonly locale: locales.Locales;
  readonly currentLocale: () => locales.Locales;
  readonly toNumber: typeof I18n.toNumber;
  readonly toCurrency: typeof I18n.toCurrency;
}

const TypedI18n = I18n as TypedI18n;

export default TypedI18n;
