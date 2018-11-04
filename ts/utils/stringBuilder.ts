import I18n from "../i18n";
import { Wallet } from "../types/pagopa";
import { convertDateToWordDistance } from "./convertDateToWordDistance";

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
  `${amount.toFixed(DISPLAYED_DIGITS)} €`;

export const buildFormattedLastUsage = (w: Wallet): string => {
  const neverString = "never";
  const lastUsageString =
    w.lastUsage === undefined
      ? neverString
      : convertDateToWordDistance(
          w.lastUsage,
          I18n.t("datetimes.yesterday"),
          I18n.t("datetimes.todayAt"),
          neverString
        );
  return lastUsageString === neverString
    ? I18n.t("cardComponent.neverUsed")
    : `${I18n.t("cardComponent.lastUsage")} ${lastUsageString}`;
};

export const buildExpirationDate = (w: Wallet): string =>
  `${w.creditCard.expireMonth}/${w.creditCard.expireYear}`;
