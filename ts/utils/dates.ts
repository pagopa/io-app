import { format as dateFnsFormat } from "date-fns";
import dfns_en from "date-fns/locale/en";
import dfns_it from "date-fns/locale/it";
import * as t from "io-ts";
import { Locales } from "../../locales/locales";
import I18n from "../i18n";
import { getLocalePrimary } from "./locale";
import { ExpireStatus } from "./messages";

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
 * It provides the format of the date depending on the system locale (DD/MM or MM/DD as default)
 * If the date is not in the current year, the date includes the year too
 * @param date
 * @param includeYear: true if the year should be included (DD/MM/YY or MM/DD/YY)
 * @param extendedYear
 */
export function formatDateAsLocal(
  date: Date,
  includeYear: boolean = false,
  extendedYear: boolean = false
): ReturnType<typeof dateFnsFormat> {
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  return extendedYear
    ? format(date, I18n.t("global.dateFormats.dayMonth")) +
        "/" +
        format(date, "YYYY")
    : includeYear || !isCurrentYear
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

export function isExpired(expireMonth: number, expireYear: number): boolean {
  const today: Date = new Date();
  const currentMonth: number = today.getMonth() + 1;
  const currentYear: number = parseInt(
    today
      .getFullYear()
      .toString()
      .slice(2),
    10
  );
  return (
    expireYear < currentYear ||
    (expireYear === currentYear && expireMonth < currentMonth)
  );
}

/**
 * A function to check if the given date is in the past or in the future.
 * It returns:
 * -VALID, if the date is in the future
 * -EXPIRING, if the date is within the next 7 days
 * -EXPIRED, if the date is in the past
 * @param date Date
 */
export const getExpireStatus = (date: Date): ExpireStatus => {
  const remainingMilliseconds = date.getTime() - Date.now();
  return remainingMilliseconds > 1000 * 60 * 60 * 24 * 7
    ? "VALID"
    : remainingMilliseconds > 0
      ? "EXPIRING"
      : "EXPIRED";
};

/* 
* this code is a copy from gcanti repository https://github.com/gcanti/io-ts-types/blob/06b29a2e74c64b21ee2f2477cabf98616a7af35f/src/Date/DateFromISOString.ts
* this because to avoid node modules conflicts given from using io-ts-types
* DateFromISOStringType is a codec to encode (date -> string) and decode (string -> date) a date in iso format
*/
export class DateFromISOStringType extends t.Type<Date, string, unknown> {
  constructor() {
    super(
      "DateFromISOString",
      (u): u is Date => u instanceof Date,
      (u, c) => {
        const validation = t.string.validate(u, c);
        if (validation.isLeft()) {
          return validation as any;
        } else {
          const s = validation.value;
          const d = new Date(s);
          return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d);
        }
      },
      a => a.toISOString()
    );
  }
}

export const DateFromISOString: DateFromISOStringType = new DateFromISOStringType();
