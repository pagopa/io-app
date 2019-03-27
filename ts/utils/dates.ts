import { format as dateFnsFormat } from "date-fns";
import dfns_en from "date-fns/locale/en";
import dfns_it from "date-fns/locale/it";
import { Locales } from "../../locales/locales";
import I18n from "../i18n";
import { getLocalePrimary } from "./locale";

type DFNSLocales = { [index in Locales]: object };

const locales: DFNSLocales = { it: dfns_it, en: dfns_en };

export function formatDateAsMonth(
  date: Date
): ReturnType<typeof dateFnsFormat> {
  const localePrimary = getLocalePrimary(I18n.currentLocale());

  return dateFnsFormat(
    date,
    "MMM",
    localePrimary.isSome() && locales.hasOwnProperty(localePrimary.value)
      ? {
          locale: locales[localePrimary.value as Locales]
        }
      : undefined
  );
}

export function formatDateAsDay(date: Date): ReturnType<typeof dateFnsFormat> {
  return dateFnsFormat(date, "DD", { locale: locales[I18n.currentLocale()] });
}

export function formatDateAsReminder(
  date: Date
): ReturnType<typeof dateFnsFormat> {
  return dateFnsFormat(date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}

export function format(
  date: string | number | Date,
  dateFormat?: string
): ReturnType<typeof dateFnsFormat> {
  return dateFnsFormat(date, dateFormat, {
    locale: locales[I18n.currentLocale()]
  });
}
