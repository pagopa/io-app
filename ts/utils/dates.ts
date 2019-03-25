import { format as dateFnsFormat } from "date-fns";
import en from "date-fns/locale/en";
import it from "date-fns/locale/it";
import I18n from "../i18n";

type Locales = {
  [index: string]: object;
};

const locales: Locales = { it, en };

/**
 * Extract language from locale coming from I18n library.
 * @param locale string - has format: "language"_"country"
 */
const getLanguage = (locale: string) => locale.slice(0, 2);

export function formatDateAsMonth(date: Date): string {
  return dateFnsFormat(date, "MMM", {
    locale: locales[getLanguage(I18n.currentLocale())]
  });
}

export function formatDateAsDay(date: Date): string {
  return dateFnsFormat(date, "DD", { locale: locales[I18n.currentLocale()] });
}

export function formatDateAsReminder(date: Date): string {
  return dateFnsFormat(date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", {
    locale: locales[I18n.currentLocale()]
  });
}

export function format(
  date: string | number | Date,
  dateFormat?: string
): string {
  return dateFnsFormat(date, dateFormat, {
    locale: locales[I18n.currentLocale()]
  });
}
