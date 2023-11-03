import { Locales } from "../../../../locales/locales";
import I18n from "../../../i18n";

enum ClaimsLocales {
  it = "it-IT",
  en = "en-US"
}

const localeToClaimsLocales = new Map<Locales, ClaimsLocales>([
  ["it", ClaimsLocales.it],
  ["en", ClaimsLocales.en]
]);

export const getClaimsFullLocale = (): ClaimsLocales =>
  localeToClaimsLocales.get(I18n.currentLocale()) ?? ClaimsLocales.it;
