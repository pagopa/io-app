import { format as dateFnsFormat } from "date-fns";
import dfns_de from "date-fns/locale/de";
import dfns_en from "date-fns/locale/en";
import dfns_it from "date-fns/locale/it";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { Errors } from "io-ts";
import { Locales, TranslationKeys } from "../../locales/locales";
import I18n from "../i18n";
import { CreditCardExpirationMonth, CreditCardExpirationYear } from "./input";
import { getLocalePrimary, localeDateFormat } from "./locale";
import { ExpireStatus } from "./messages";
import { NumberFromString } from "./number";

type DateFnsLocale = typeof import("date-fns/locale/it");

type DFNSLocales = Record<Locales, DateFnsLocale>;

const locales: DFNSLocales = { it: dfns_it, en: dfns_en, de: dfns_de };

export const pad = (n: number) => n.toString().padStart(2, "0");

/*
 * This function is specific for the fiscal code birthday rendering.
 * The birthday is an ISO8601 format for midnight.
 * It returns the date in short format.
 *
 * i.e. 1977-05-22T00:00:00.000Z -> 22/05/1977
 */
export const formatFiscalCodeBirthdayAsShortFormat = (
  date: Date | undefined
): string =>
  pipe(
    date,
    O.fromNullable,
    O.chain(O.fromPredicate(d => !isNaN(d.getTime()))),
    O.fold(
      () => I18n.t("global.date.invalid"),
      d => {
        const year = d.getUTCFullYear();
        const month = pad(d.getUTCMonth() + 1);
        const day = pad(d.getUTCDate());
        return `${day}/${month}/${year}`;
      }
    )
  );

export const formatFiscalCodeBirthdayAsAccessibilityReadableFormat = (
  date: Date | undefined
): string =>
  pipe(
    date,
    O.fromNullable,
    O.chain(O.fromPredicate(d => !isNaN(d.getTime()))),
    O.fold(
      () => I18n.t("global.date.invalid"),
      d => {
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth() + 1;
        const date = d.getUTCDate();
        const day = d.getUTCDay();
        const dayTranslationKey = I18n.t(
          `date.day_names.${day}` as TranslationKeys
        );
        const monthTranslationKey = I18n.t(
          `date.month_names.${month}` as TranslationKeys
        );

        return `${dayTranslationKey} ${date} ${monthTranslationKey} ${year}`;
      }
    )
  );

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
    pipe(
      localePrimary,
      O.chainNullableK(lp => locales[lp as Locales]), // becomes empty if locales[lp] is undefined
      O.map(locale => ({ locale })),
      O.toUndefined // if some returns the value, if empty return undefined)
    )
  );
}

/**
 * Try to parse month and validate as month
 * @param month
 */
export const decodeCreditCardMonth = (
  month: string | number | undefined
): E.Either<Error | Errors, number> => {
  // convert month to string (if it is a number) and
  // ensure it is left padded: 2 -> 02
  const monthStr = (month ?? "").toString().trim().padStart(2, "0");
  // check that month matches the pattern (01-12)
  if (!CreditCardExpirationMonth.is(monthStr)) {
    return E.left(
      new Error("month doesn't follow CreditCardExpirationMonth pattern")
    );
  }
  return NumberFromString.decode(monthStr);
};

/**
 * Try to parse year and validate as year
 * @param year
 */
export const decodeCreditCardYear = (
  year: string | number | undefined
): E.Either<Error | Errors, number> => {
  const yearStr = (year ?? "").toString().trim();
  // if the year is 2 digits, convert it to 4 digits: 21 -> 2021
  if (yearStr.length === 2) {
    // check that year is included matches the pattern (00-99)
    if (!CreditCardExpirationYear.is(yearStr)) {
      return E.left(
        new Error("year doesn't follow CreditCardExpirationYear pattern")
      );
    }
    const now = new Date();
    return NumberFromString.decode(
      now.getFullYear().toString().substring(0, 2) + yearStr.toString()
    );
  }
  return NumberFromString.decode(yearStr);
};

/**
 * ⚠️ Beware, the Date that this method returns is partially correct since is created only from year and month.
 * Eg: month: "03" year: "2022" will return -> 2022-02-28T23:00:00.000Z
 * The date thus returned is therefore ambiguous since it may not correspond to the intended semantics
 * (for example the date returned is not applicable to credit cards that includes the last day of the month)
 * Using the date thus generated to make comparisons could lead to unexpected behaviour
 * @param month
 * @param year
 * @deprecated
 */
export const dateFromMonthAndYear = (
  month: string | number | undefined,
  year: string | number | undefined
): O.Option<Date> => {
  const maybeMonth = decodeCreditCardMonth(month);
  const maybeYear = decodeCreditCardYear(year);
  if (E.isLeft(maybeMonth) || E.isLeft(maybeYear)) {
    return O.none;
  }
  return O.some(new Date(maybeYear.right, maybeMonth.right - 1));
};

/**
 * if expireMonth and expireYear are defined, and they represent a valid date then
 * return some, with 'true' if the given date is expired compared with now.
 * return none if the input is not valid
 * {@expireYear could be 2 or 4 digits}
 * @param expireMonth
 * @param expireYear
 */
export const isExpired = (
  expireMonth: string | number | undefined,
  expireYear: string | number | undefined
): E.Either<Error, boolean> => {
  const maybeMonth = decodeCreditCardMonth(expireMonth);
  const maybeYear = decodeCreditCardYear(expireYear);
  return pipe(
    maybeYear,
    E.chain(year =>
      pipe(
        maybeMonth,
        E.map(month => {
          const now = new Date();
          const nowYearMonth = new Date(now.getFullYear(), now.getMonth() + 1);
          const cardExpirationDate = new Date(year, month);
          return nowYearMonth > cardExpirationDate;
        })
      )
    ),
    E.mapLeft(_ => new Error("invalid input"))
  );
};

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
        if (E.isLeft(validation)) {
          return validation as any;
        } else {
          const s = validation.right;
          const d = new Date(s);
          return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d);
        }
      },
      a => a.toISOString()
    );
  }
}

export const DateFromISOString: DateFromISOStringType =
  new DateFromISOStringType();

/**
 *
 * It provides, given 2 strings that represent the year and the month, a single string in the format
 * specified by the locales (IT: MM/YY, EN: MM/YY) or undefined if one of the inputs is not provided
 * @param fullYear
 * @param month
 */
export const getTranslatedShortNumericMonthYear = (
  fullYear?: string,
  month?: string
): string | undefined => {
  if (!fullYear || !month) {
    return undefined;
  }
  const year = parseInt(fullYear, 10);
  const indexedMonth = parseInt(month, 10);
  if (isNaN(year) || isNaN(indexedMonth)) {
    return undefined;
  }
  return localeDateFormat(
    new Date(year, indexedMonth - 1),
    I18n.t("global.dateFormats.shortNumericMonthYear")
  );
};
