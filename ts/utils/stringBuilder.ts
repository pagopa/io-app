import I18n from "../i18n";
import { Wallet } from "../types/pagopa";

/**
 * Build a string based on the currency that
 * is to be displayed. The only currently supposed
 * currency is EUR => "AMOUNT €". Other currencies,
 * e.g. USD, can be handled here differently ("$ AMOUNT")
 * @param amount amount (can be a float, will be truncated to its 2nd digit )
 */
const DISPLAYED_DIGITS = 2;

export const centsToAmount = (cents: number): number =>
  cents / Math.pow(10, DISPLAYED_DIGITS);

export const formatNumberAmount = (amount: number): string =>
  I18n.toCurrency(amount, {
    precision: DISPLAYED_DIGITS,
    separator: I18n.t("global.localization.decimalSeparator"),
    unit: "€",
    format: "%n %u"
  });

export const buildExpirationDate = (w: Wallet): string =>
  `${w.creditCard.expireMonth}/${w.creditCard.expireYear}`;
