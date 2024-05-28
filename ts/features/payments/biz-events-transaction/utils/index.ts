import { SectionListData } from "react-native";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";

export const RECEIPT_DOCUMENT_TYPE_PREFIX = "data:application/pdf;base64,";

/**
 * Function that groups the transactions by month and returns an array of objects with the month as title and the transactions as data
 * - The year is shown only if it's different from the current year
 */
export const groupTransactionsByMonth = (
  transactions: ReadonlyArray<TransactionListItem>
): Array<SectionListData<TransactionListItem>> => {
  const groups: { [month: string]: Array<TransactionListItem> } = {};

  transactions.forEach(element => {
    if (element.transactionDate !== undefined) {
      const month = new Date(element.transactionDate).toLocaleString(
        "default",
        {
          month: "long",
          year:
            new Date().getFullYear() ===
              new Date(element.transactionDate).getFullYear()
              ? undefined
              : "numeric"
        }
      );

      // eslint-disable-next-line functional/immutable-data
      groups[month] = groups[month] || [];
      // eslint-disable-next-line functional/immutable-data
      groups[month].push(element);
    }
  });

  return Object.keys(groups).map(month => ({
    title: month,
    data: groups[month]
  }));
};

// This function formats the text of the amount that is a string composed by "1000.00" in the format "1.000,00 €" allowing only two decimal digits
export const formatAmountText = (amount: string): string => {
  const amountNumber = parseFloat(amount);
  return amountNumber.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};


export const byteArrayToBase64 = (byteArray: Uint8Array): string => {
  // Convert Uint8Array to Buffer
  const buffer = Buffer.from(byteArray);

  // Convert Buffer to Base64 string
  return buffer.toString('base64');
};
