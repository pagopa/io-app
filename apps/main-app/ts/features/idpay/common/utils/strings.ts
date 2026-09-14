import { format } from "../../../../utils/dates";
import {
  formatNumberAmount,
  formatNumberCentsToAmount
} from "../../../../utils/stringBuilder";

export const formatNumberCurrency = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

export const formatNumberCurrencyCents = (cents: number) =>
  formatNumberCurrency(cents / 100);

export const formatNumberCurrencyOrDefault = (
  input: number | undefined,
  defaultValue = "-"
) => (input === undefined ? defaultValue : formatNumberCurrency(input));

export const formatNumberCurrencyCentsOrDefault = (
  input: number | undefined,
  defaultValue = "-"
) => (input === undefined ? defaultValue : formatNumberCurrencyCents(input));

/**
 * Formats an absolute number amount or returns a default value if the input is undefined.
 *
 * This function takes a number and converts it into its absolute value, then formats it as a string
 * using the 'formatNumberAmount' function. If the input is undefined, it returns the specified default value.
 *
 * @param {number | undefined} amount - The number amount in cents to be formatted, or undefined if not available.
 * @param {string} [defaultValue='-'] - The default value to be returned when the input 'amount' is undefined.
 *
 * @returns {string} - The formatted absolute number as a string or the default value.
 */
export const formatAbsNumberAmountCentsOrDefault = (
  amount: number | undefined,
  defaultValue = "-"
) =>
  amount === undefined
    ? defaultValue
    : formatNumberCentsToAmount(Math.abs(amount));

/**
 *   Takes a nullable date and formats it to a string.
 *   - Base default : '-'
 *   - Base format: 'D MMMM YYYY, HH:mm'
 *   - Uses date_fns as formatter
 */
export const formatDateOrDefault = (
  input?: Date,
  defaultValue = "-",
  dateFormat = "D MMMM YYYY, HH:mm"
) => (input === undefined ? defaultValue : format(input, dateFormat));
