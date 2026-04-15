import I18n from "i18next";
import { CardInfo } from "../../definitions/pagopa/walletv2/CardInfo";

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
  displayCurrency: boolean = false,
  currencyPosition: "left" | "right" = "left"
): string => {
  const formattedAmount = new Intl.NumberFormat(I18n.language, {
    useGrouping: true,
    maximumFractionDigits: DISPLAYED_DIGITS,
    minimumFractionDigits: DISPLAYED_DIGITS
  }).format(amount);

  return displayCurrency
    ? currencyPosition === "left"
      ? `€ ${formattedAmount}`
      : `${formattedAmount} €`
    : `${formattedAmount}`;
};

/**
 * Converts in a localized value/amount removing the decimal part after the decimal separator
 * @param amount
 * @param displayCurrency
 */
export const formatNumberWithNoDigits = (
  amount: number,
  displayCurrency: boolean = false
): string => {
  const formattedAmount = new Intl.NumberFormat(I18n.language, {
    useGrouping: true,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);

  return displayCurrency ? `€ ${formattedAmount}` : `${formattedAmount}`;
};

export const formatNumberCentsToAmount = (
  cents: number,
  displayCurrency: boolean = false,
  currencyPosition: "left" | "right" = "left"
): string =>
  formatNumberAmount(centsToAmount(cents), displayCurrency, currencyPosition);

export const buildExpirationDate = (creditCard: CardInfo): string =>
  `${creditCard.expireMonth}/${creditCard.expireYear}`;

/**
 * Format a number in a integer representation, removing all the decimal and adding the
 * delimiter
 * @param amount
 */
export const formatIntegerNumber = (amount: number): string =>
  new Intl.NumberFormat(I18n.language, {
    useGrouping: true,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
