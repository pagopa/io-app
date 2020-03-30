import I18n from "../i18n";
import { CreditCard } from "../types/pagopa";

const DISPLAYED_DIGITS = 2;

/**
 * Build a string based on the currency that
 * is to be displayed. The only currently supposed
 * currency is EUR => "AMOUNT €". Other currencies,
 * e.g. USD, can be handled here differently ("$ AMOUNT")
 * @param amount amount (can be a float, will be truncated to its 2nd digit )
 */
export const centsToAmount = (cents: number): number =>
  cents / Math.pow(10, DISPLAYED_DIGITS);

export const formatNumberAmount = (
  amount: number,
  displayCurrency: boolean = false
): string =>
  I18n.toCurrency(amount, {
    precision: DISPLAYED_DIGITS,
    separator: I18n.t("global.localization.decimalSeparator"),
    format: displayCurrency ? "€ %n" : "%n"
  });

export const formatNumberCentsToAmount = (cents: number): string =>
  formatNumberAmount(centsToAmount(cents));

export const buildExpirationDate = (creditCard: CreditCard): string =>
  `${creditCard.expireMonth}/${creditCard.expireYear}`;
