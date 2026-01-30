import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SectionListData } from "react-native";
import { InfoNotice } from "../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { NetworkError } from "../../../../utils/errors";
import { capitalizeTextName } from "../../../../utils/strings";

export const RECEIPT_DOCUMENT_TYPE_PREFIX = "data:application/pdf;base64,";

/**
 * Function that groups the transactions by month and returns an array of objects with the month as title and the transactions as data
 * - The year is shown only if it's different from the current year
 */
export const groupTransactionsByMonth = (
  transactions: ReadonlyArray<NoticeListItem>
): Array<SectionListData<NoticeListItem>> => {
  const groups = transactions.reduce((acc, element) => {
    if (element.noticeDate !== undefined) {
      const isCurrentYear =
        new Date().getFullYear() === new Date(element.noticeDate).getFullYear();
      const month = new Date(element.noticeDate).toLocaleString("default", {
        month: "long",
        year: isCurrentYear ? undefined : "numeric"
      });
      return {
        ...acc,
        [month]: [...(acc[month] || []), element]
      };
    }
    return acc;
  }, {} as { [month: string]: Array<NoticeListItem> });

  return Object.keys(groups).map(month => ({
    title: month,
    data: groups[month]
  }));
};

// This function formats the text of the amount that is a string composed by "1000.00" in the format "1.000,00 €" allowing only two decimal digits
export const formatAmountText = (amount: string): string => {
  const normalizedAmount = amount.replace(",", ".");
  const amountNumber = parseFloat(normalizedAmount);
  if (isNaN(amountNumber)) {
    return "";
  }
  return amountNumber.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const byteArrayToBase64 = (byteArray: Uint8Array): string => {
  // Convert Uint8Array to Buffer
  const buffer = Buffer.from(byteArray);

  // Convert Buffer to Base64 string
  return buffer.toString("base64");
};

/**
 * Function that returns the payer info label formatted as "name\n(taxCode)"
 */
export const getPayerInfoLabel = (payer: InfoNotice["payer"]): string => {
  if (!payer) {
    return "";
  }

  const name = payer.name ? capitalizeTextName(payer.name).trim() : "";
  const taxCode = payer.taxCode ? payer.taxCode.trim() : "";

  const payerInfo = name ? (taxCode ? `${name}\n(${taxCode})` : name) : taxCode;

  return payerInfo.trim();
};

/**
 * Function that calculates the total amount of a transaction by summing the amount and the fee
 */
export const calculateTotalAmount = (
  transactionInfo?: InfoNotice
): string | undefined => {
  if (!transactionInfo || !transactionInfo.amount) {
    return undefined;
  }

  const amountString = transactionInfo.amount.replace(",", ".");
  const feeString = transactionInfo.fee?.replace(",", ".");

  if (isNaN(parseFloat(amountString))) {
    return undefined;
  }

  const amount = parseFloat(amountString);
  const fee =
    !feeString || isNaN(parseFloat(feeString)) ? 0 : parseFloat(feeString);
  const total = amount + fee;

  return total.toFixed(2);
};

/**
 * Filters transactions by a given transaction ID and returns the filtered transactions along with the index of the removed transaction.
 *
 * @param transactions - A potential array of NoticeListItem objects wrapped in a Pot, which may contain a NetworkError.
 * @param transactionId - The ID of the transaction to filter out.
 * @returns An object containing:
 *   - `filteredTransactions`: An array of NoticeListItem objects excluding the transaction with the given ID.
 *   - `removedIndex`: The index of the removed transaction in the original array, or -1 if the transaction was not found.
 */
export const filterTransactionsByIdAndGetIndex = (
  transactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>,
  transactionId: string
): {
  filteredTransactions: Array<NoticeListItem>;
  removedIndex: number;
} => {
  const transactionList = pot.getOrElse(transactions, []);
  const removedIndex = transactionList.findIndex(
    transaction => transaction.eventId === transactionId
  );
  const filteredTransactions = transactionList.filter(
    transaction => transaction.eventId !== transactionId
  );
  return { filteredTransactions, removedIndex };
};

export const getTransactionByIndex = (
  transactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>,
  index: number
): NoticeListItem => pot.getOrElse(transactions, [])[index];

export const restoreTransactionAtIndex = (
  transactionPot: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>,
  restoreItem: NoticeListItem,
  index: number
) =>
  pot.map(transactionPot, transactions => [
    ...transactions.slice(0, index),
    restoreItem,
    ...transactions.slice(index)
  ]);

export const removeAsterisks = (text: string): string =>
  text.replace(/\*/g, "");

export const isValidPspName = (pspName: string | undefined): boolean =>
  pipe(
    pspName,
    O.fromNullable,
    O.map(name => name !== "-"),
    O.getOrElse(() => false)
  );
