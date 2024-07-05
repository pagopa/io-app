import { SectionListData } from "react-native";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { InfoTransactionView } from "../../../../../definitions/pagopa/biz-events/InfoTransactionView";

export const RECEIPT_DOCUMENT_TYPE_PREFIX = "data:application/pdf;base64,";

/**
 * Function that groups the transactions by month and returns an array of objects with the month as title and the transactions as data
 * - The year is shown only if it's different from the current year
 */
export const groupTransactionsByMonth = (
  transactions: ReadonlyArray<TransactionListItem>
): Array<SectionListData<TransactionListItem>> => {
  const groups = transactions.reduce((acc, element) => {
    if (element.transactionDate !== undefined) {
      const isCurrentYear =
        new Date().getFullYear() ===
        new Date(element.transactionDate).getFullYear();
      const month = new Date(element.transactionDate).toLocaleString(
        "default",
        {
          month: "long",
          year: isCurrentYear ? undefined : "numeric"
        }
      );
      return {
        ...acc,
        [month]: [...(acc[month] || []), element]
      };
    }
    return acc;
  }, {} as { [month: string]: Array<TransactionListItem> });

  return Object.keys(groups).map(month => ({
    title: month,
    data: groups[month]
  }));
};

// This function is used to format the amount in the transaction list as we know that the backend
// .. will send the amount in the format "123,45" and we want to show it as "123,45 €" or "1.234,56" as "1.234,56 €"
export const formatAmountText = (amount: string): string => {
  if (isNaN(parseFloat(amount))) {
    return "";
  }

  return `${amount} €`;
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
export const getPayerInfoLabel = (
  payer: InfoTransactionView["payer"]
): string => {
  if (!payer) {
    return "";
  }

  const name = payer.name ? payer.name.trim() : "";
  const taxCode = payer.taxCode ? `(${payer.taxCode.trim()})` : "";

  const payerInfo =
    name && taxCode ? `${name}\n${taxCode}` : `${name}${taxCode}`;

  return payerInfo.trim();
};

/**
 * Function that calculates the total amount of a transaction by summing the amount and the fee
 */
export const calculateTotalAmount = (
  transactionInfo?: InfoTransactionView
): string | undefined => {
  if (!transactionInfo || !transactionInfo.amount || !transactionInfo.fee) {
    return undefined;
  }

  const amountString = transactionInfo.amount.replace(",", ".");
  const feeString = transactionInfo.fee.replace(",", ".");

  if (isNaN(parseFloat(amountString)) || isNaN(parseFloat(feeString))) {
    return undefined;
  }

  const amount = parseFloat(amountString);
  const fee = parseFloat(feeString);
  const total = amount + fee;

  return total.toFixed(2);
};
