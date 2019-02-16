import * as t from "io-ts";
import { PatternString } from "io-ts-commons/lib/strings";

const MIN_PAN_DIGITS = 15;
const MAX_PAN_DIGITS = 19;

/**
 * A string that matches credit cards PAN
 *
 * Note: pagoPA's pan may contain '*'s to hide part of the pan
 */
export const CreditCardPan = PatternString(
  `^[0-9\\*]{${MIN_PAN_DIGITS},${MAX_PAN_DIGITS}}$`
);
export type CreditCardPan = t.TypeOf<typeof CreditCardPan>;

/**
 * A string that matches a two digits month number (00-12)
 */
export const CreditCardExpirationMonth = PatternString("^(0[1-9]|1[0-2])$");
export type CreditCardExpirationMonth = t.TypeOf<
  typeof CreditCardExpirationMonth
>;

/**
 * A string that matches a two digits year number (00-99)
 */
// FIXME: check that expiration year is >= current year
// (possibly check month as well if year == current year)
export const CreditCardExpirationYear = PatternString("^[0-9]{2}$");
export type CreditCardExpirationYear = t.TypeOf<
  typeof CreditCardExpirationYear
>;

/**
 * A string that matches a credit card CVC code
 */
export const CreditCardCVC = PatternString("^[0-9]{3,4}$");
export type CreditCardCVC = t.TypeOf<typeof CreditCardCVC>;
