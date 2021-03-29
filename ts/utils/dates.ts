import { compareDesc, endOfMonth, format as dateFnsFormat } from "date-fns";
import dfns_en from "date-fns/locale/en";
import dfns_it from "date-fns/locale/it";
import * as t from "io-ts";
import { none, Option, some } from "fp-ts/lib/Option";
import { Locales } from "../../locales/locales";
import I18n from "../i18n";
import { getLocalePrimary } from "./locale";
import { ExpireStatus } from "./messages";
import { NumberFromString } from "./number";
import { CreditCardExpirationMonth, CreditCardExpirationYear } from "./input";

type DateFnsLocale = typeof import("date-fns/locale/it");

type DFNSLocales = Record<Locales, DateFnsLocale>;

const locales: DFNSLocales = { it: dfns_it, en: dfns_en };

// return a string representing the date dd/MM/YYYY (ex: 1 Jan 1970 -> 01/01/1970)
export const formatDateAsShortFormat = (date: Date): string =>
  isNaN(date.getTime())
    ? I18n.t("global.date.invalid")
    : I18n.strftime(date, I18n.t("global.dateFormats.shortFormat"));

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
 * @param date
 * @param includeYear: true if the year should be included (DD/MM/YY or MM/DD/YY)
 * @param extendedYear
 */
export function formatDateAsLocal(
  date: Date,
  includeYear: boolean = false,
  extendedYear: boolean = false
): ReturnType<typeof dateFnsFormat> {
  const dateFormat = I18n.t("global.dateFormats.dayMonth");
  return extendedYear
    ? format(date, dateFormat) + "/" + format(date, "YYYY")
    : includeYear
    ? format(date, dateFormat) + "/" + format(date, "YY")
    : format(date, dateFormat);
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

/**
 * if expireMonth and expireYear are defined and they represent a number
 * return some(true) if the given date is expired compared with now.
 * {@expireYear could be 2 or 4 digits}
 * note: it compares the last day of the month
 * example: 03/21 becomes a comparison between 31/03/2021 and current time
 * @param expireMonth
 * @param expireYear
 */
export function isExpired(
  expireMonth: string | number | undefined,
  expireYear: string | number | undefined
): Option<boolean> {
  // convert month to string (if it is a number) and
  // ensure it is left padded: 2 -> 02
  const monthStr = (expireMonth ?? "").toString().trim().padStart(2, "0");
  // eslint-disable-next-line functional/no-let
  let yearStr = (expireYear ?? "").toString().trim();
  // check that month is included matches the pattern (01-12)
  if (!CreditCardExpirationMonth.is(monthStr)) {
    return none;
  }
  // if the year is 2 digits, convert it to 4 digits: 21 -> 2021
  if (yearStr.length === 2) {
    // check that month is included matches the pattern (00-99)
    if (!CreditCardExpirationYear.is(yearStr)) {
      return none;
    }
    const now = new Date();
    yearStr = now.getFullYear().toString().substring(0, 2) + yearStr.toString();
  }
  // check if the built string are valid numbers
  const month = NumberFromString.decode(monthStr);
  const year = NumberFromString.decode(yearStr);
  if (month.isLeft() || year.isLeft()) {
    return none;
  }
  // get the last day of the month
  const date = endOfMonth(`${month.value}/01/${year.value}`);
  return some(compareDesc(date, new Date()) > 0);
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
