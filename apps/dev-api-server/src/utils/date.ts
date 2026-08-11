import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

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

export const getDateMsDifference = (firstDate: Date, secondDate: Date) =>
  Math.abs(firstDate.getTime() - secondDate.getTime());
