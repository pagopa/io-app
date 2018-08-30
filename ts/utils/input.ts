import { PatternString } from "italia-ts-commons/lib/strings";
import * as t from "io-ts";

const minPanDigits = 15;
const maxPanDigits = 19;
export const CreditCardPan = PatternString(
  `^[0-9]{${minPanDigits},${maxPanDigits}}$`
);
export type CreditCardPan = t.TypeOf<typeof CreditCardPan>;

export const CreditCardExpirationMonth = PatternString("^(0[1-9]|1[0-2])$");
export type CreditCardExpirationMonth = t.TypeOf<
  typeof CreditCardExpirationMonth
>;

// FIXME: check that expiration year is >= current year
// (possibly check month as well if year == current year)
export const CreditCardExpirationYear = PatternString("^[0-9]{2}$");
export type CreditCardExpirationYear = t.TypeOf<
  typeof CreditCardExpirationMonth
>;

export const CreditCardCVC = PatternString("^[0-9]{3,4}$");
export type CreditCardCVC = t.TypeOf<typeof CreditCardCVC>;
