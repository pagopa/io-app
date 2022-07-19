import * as t from "io-ts";
import { PatternString } from "italia-ts-commons/lib/strings";

const isDate = (v: t.mixed): v is Date => v instanceof Date;

/**
 * Accepts short formats (ie. "2018-10-13")
 * with or without time and timezone parts.
 */
export const DateFromString = new t.Type<Date, string>(
  "DateFromString",
  isDate,
  (v, c) =>
    isDate(v)
      ? t.success(v)
      : t.string.validate(v, c).chain(s => {
          const d = new Date(s);
          return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d);
        }),
  a => a.toISOString()
);

export type DateFromString = t.TypeOf<typeof DateFromString>;

export const patternDateFromString = (
  pattern: string,
  tagName: string
): t.Type<Date, string> =>
  new t.Type<Date, string>(
    tagName,
    isDate,
    (v, c) =>
      isDate(v)
        ? t.success(v)
        : PatternString(pattern)
            .validate(v, c)
            .chain(s => {
              const d = new Date(s);
              return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d);
            }),
    a => a.toISOString()
  );

/**
 * ISO8601 format for dates.
 *
 */
/**
 * Date and time is separated with a capital T.
 * UTC time is defined with a capital letter Z.
 *
 */
const UTC_ISO8601_FULL_REGEX =
  "^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(\\.\\d+)?(Z)?$";
/**
 * Date and time is separated with a capital T.
 * Timezone is defined with +/-00:00 format.
 *
 */
const TIMEZONE_ISO8601_FULL_REGEX =
  "^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(\\.\\d+)?[+-](\\d{2})\\:(\\d{2})$";

/**
 * Accepts only full ISO8601 format with UTC (Z) timezone
 *
 * ie. "2018-10-13T00:00:00.000Z"
 */
export const UtcOnlyIsoDateFromString = patternDateFromString(
  UTC_ISO8601_FULL_REGEX,
  "UtcOnlyIsoDateFromString"
);
export type UtcOnlyIsoDateFromString = t.TypeOf<
  typeof UtcOnlyIsoDateFromString
>;

/**
 * Accepts only full ISO8601 format with +/-00:00 timezone
 *
 * ie. "2018-10-13T00:00:00.000+00:00"
 */
export const TimezoneOnlyIsoDateFromString = patternDateFromString(
  TIMEZONE_ISO8601_FULL_REGEX,
  "TimezoneOnlyIsoDateFromString"
);
export type TimezoneOnlyIsoDateFromString = t.TypeOf<
  typeof TimezoneOnlyIsoDateFromString
>;

export const IsoDateFromString = t.union(
  [UtcOnlyIsoDateFromString, TimezoneOnlyIsoDateFromString],
  "IsoDateFromString"
);
export type IsoDateFromString = typeof IsoDateFromString;

/**
 * @deprecated use IsoDateFromString instead.
 */
export const UTCISODateFromString = IsoDateFromString;
/**
 * @deprecated use IsoDateFromString instead.
 */
export type UTCISODateFromString = typeof UTCISODateFromString;

/**
 * Accepts only a valid timestamp format (number)
 *
 * ie. 1577836800000
 */
export const DateFromTimestamp = new t.Type<Date, number>(
  "DateFromTimestamp",
  isDate,
  (v, c) =>
    isDate(v)
      ? t.success(v)
      : t.number.validate(v, c).chain(s => {
          const d = new Date(s);
          return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d);
        }),
  a => a.valueOf()
);

export type DateFromTimestamp = t.TypeOf<typeof DateFromTimestamp>;
