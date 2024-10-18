import { SectionListData } from "react-native";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { InfoNotice } from "../../../../../definitions/pagopa/biz-events/InfoNotice";

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
