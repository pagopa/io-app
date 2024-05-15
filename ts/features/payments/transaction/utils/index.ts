import { SectionListData } from "react-native";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";

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
