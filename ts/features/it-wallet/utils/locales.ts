import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { Locales } from "../../../../locales/locales";
import I18n from "../../../i18n";
import { localeDateFormat } from "../../../utils/locale";
import { dateFormatRegex } from "./mocks";

/**
 * Enum for the claims locales.
 * This is used to get the correct locale for the claims.
 * Currently the only supported locales are it-IT and en-US.
 */
enum ClaimsLocales {
  it = "it-IT",
  en = "en-US"
}

/**
 * Map from the app locales to the claims locales.
 * Currently en is mapped to en-US and it to it-IT.
 */
const localeToClaimsLocales = new Map<Locales, ClaimsLocales>([
  ["it", ClaimsLocales.it],
  ["en", ClaimsLocales.en]
]);

/**
 * Helper function to get a full claims locale locale from the current app locale.
 * @returns a enum value for the claims locale.
 */
export const getClaimsFullLocale = (): ClaimsLocales =>
  localeToClaimsLocales.get(I18n.currentLocale()) ?? ClaimsLocales.it;

/**
 * Converts a string in the YYYY-MM-DD format to a locale date string.
 * @param str - the date string to convert
 * @param format - the format to use
 * @returns the converted date string or the original string if the format is not YYYY-MM-DD
 */
export const localeDateFormatOrSame = (str: string) =>
  pipe(
    dateFormatRegex,
    O.fromPredicate(p => p.test(str)),
    O.fold(
      () => str,
      () =>
        localeDateFormat(
          new Date(str),
          I18n.t("global.dateFormats.shortFormat")
        )
    )
  );
