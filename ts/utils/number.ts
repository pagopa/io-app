import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

/*
 * this code is a copy from gcanti repository https://gcanti.github.io/io-ts-types/modules/NumberFromString.ts.html
 * this because to avoid node modules conflicts given from using io-ts-types
 * NumberFromStringType is a codec to encode (number -> string) and decode (string -> number)
 */
export class NumberFromStringType extends t.Type<number, string> {
  constructor() {
    super(
      "NumberFromString",
      t.number.is,
      (u, c) => {
        const validation = t.string.validate(u, c);
        if (E.isLeft(validation)) {
          return validation as any;
        } else {
          const s = validation.right;
          const n = +s;
          return isNaN(n) ? t.failure(s, c) : t.success(n);
        }
      },
      String
    );
  }
}

export const NumberFromString = new NumberFromStringType();

export const roundToThirdDecimal = (value: number) =>
  isNaN(value) ? 0 : Math.floor(value * 1000) / 1000;

/**
 * Converts bytes to gigabytes by using decimal system and rounds to 1 decimal
 * @param bytes - the number of bytes to convert
 * @returns the number of gigabytes rounded to 1 decimal
 */
export const bytesToGigabytes = (bytes: number) =>
  isNaN(bytes) ? 0 : parseFloat((bytes / Math.pow(10, 9)).toFixed(1));
