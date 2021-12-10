import { CardInfo } from "../../definitions/pagopa/walletv2/CardInfo";
import I18n from "../i18n";

const DISPLAYED_DIGITS = 2;

/**
 * Build a string based on the currency that
 * is to be displayed. The only currently supposed
 * currency is EUR => "AMOUNT €". Other currencies,
 * e.g. USD, can be handled here differently ("$ AMOUNT")
 * @param cents amount (can be a float, will be truncated to its 2nd digit )
 */
export const centsToAmount = (cents: number): number =>
  cents / Math.pow(10, DISPLAYED_DIGITS);

export const formatNumberAmount = (
  amount: number,
  displayCurrency: boolean = false
): string =>
  I18n.toCurrency(amount, {
    precision: DISPLAYED_DIGITS,
    delimiter: I18n.t("global.localization.delimiterSeparator"),
    separator: I18n.t("global.localization.decimalSeparator"),
    format: displayCurrency ? "€ %n" : "%n"
  });

/**
 * Converts in a localized value/amount removing the decimal part after the decimal separator
 * @param amount
 * @param displayCurrency
 */
export const formatNumberWithNoDigits = (
  amount: number,
  displayCurrency: boolean = false
): string =>
  I18n.toCurrency(amount, {
    precision: 0,
    delimiter: I18n.t("global.localization.delimiterSeparator"),
    separator: I18n.t("global.localization.decimalSeparator"),
    format: displayCurrency ? "€ %n" : "%n"
  });

export const formatNumberCentsToAmount = (
  cents: number,
  displayCurrency: boolean = false
): string => formatNumberAmount(centsToAmount(cents), displayCurrency);

export const buildExpirationDate = (creditCard: CardInfo): string =>
  `${creditCard.expireMonth}/${creditCard.expireYear}`;

/**
 * Format a number in a integer representation, removing all the decimal and adding the
 * delimiter
 * @param amount
 */
export const formatIntegerNumber = (amount: number): string =>
  I18n.toNumber(amount, {
    precision: 0,
    delimiter: I18n.t("global.localization.delimiterSeparator"),
    separator: I18n.t("global.localization.decimalSeparator")
  });
