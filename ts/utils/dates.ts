import { format as dateFnsFormat } from "date-fns";
import it from "date-fns/locale/it";
import en from "date-fns/locale/en";
import I18n from "../i18n";

type Locales = {
  [index: string]: Object;
};

const locales: Locales = {
  it: it,
  en: en
};

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

export function format(date: string | number | Date, format?: string): string {
  return dateFnsFormat(date, format, {
    locale: locales[I18n.currentLocale()]
  });
}
