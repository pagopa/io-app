import { format as dateFnsFormat } from "date-fns";
import dfns_en from "date-fns/locale/en";
import dfns_it from "date-fns/locale/it";
import { Locales } from "../../locales/locales";
import I18n from "../i18n";
import { getLocalePrimary } from "./locale";

type DFNSLocales = { [index in Locales]: object };

const locales: DFNSLocales = { it: dfns_it, en: dfns_en };

export function formatDateAsMonth(date: Date): ReturnType<typeof format> {
  return format(date, "MMM");
}

export function formatDateAsDay(date: Date): ReturnType<typeof format> {
  return format(date, "DD");
}

export function formatDateAsReminder(
  date: Date
): ReturnType<typeof dateFnsFormat> {
  return dateFnsFormat(date, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}

/**
 *
 * It provides the format of the date depending on the geography (DD/MM or MM/DD as default)
 * @param date
 * @param includeYear: true if the year should be included (DD/MM/YY or MM/DD/YY)
 */
export function formatDateAsLocal(
  date: Date,
  includeYear: boolean = false
): ReturnType<typeof dateFnsFormat> {
  return includeYear
    ? format(date, I18n.t("global.dateFormats.dayMonth")) +
        "/" +
        format(date, "YY")
    : format(date, I18n.t("global.dateFormats.dayMonth"));
}

export function format(
  date: string | number | Date,
  dateFormat?: string
): ReturnType<typeof dateFnsFormat> {
  const localePrimary = getLocalePrimary(I18n.currentLocale());
  return dateFnsFormat(
    date,
    dateFormat,
    localePrimary
      .mapNullable(lp => locales[lp as Locales]) // becomes empty if locales[lp] is undefined
      .map(locale => ({ locale }))
      .toUndefined() // if some returns the value, if empty return undefined
  );
}
