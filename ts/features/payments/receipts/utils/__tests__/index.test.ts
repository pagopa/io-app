import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  calculateTotalAmount,
  filterTransactionsByIdAndGetIndex,
  formatAmountText,
  getPayerInfoLabel,
  getTransactionByIndex,
  isValidPspName,
  removeAsterisks,
  restoreTransactionAtIndex
} from "..";
import { InfoNotice } from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";

const mockTransactions: ReadonlyArray<NoticeListItem> = [
  {
    eventId: "1",
    amount: "10.00",
    isCart: false,
    isDebtor: false,
    isPayer: true,
    noticeDate: "2021-01-01",
    payeeTaxCode: "123456789",
    payeeName: "John Doe"
  },
  {
    eventId: "2",
    amount: "20.00",
    isCart: false,
    isDebtor: true,
    isPayer: false,
    noticeDate: "2021-01-02",
    payeeTaxCode: "987654321",
    payeeName: "Jane Doe"
  },
  {
    eventId: "3",
    amount: "30.00",
    isCart: true,
    isDebtor: false,
    isPayer: false,
    noticeDate: "2021-01-03",
    payeeTaxCode: "123456789",
    payeeName: "John Doe"
  }
];
describe("formatAmountText", () => {
  it('should format "1000.00" as "1.000,00 €"', () => {
    const result = formatAmountText("1000.00");
    expect(result).toBe("1.000,00 €");
  });

  it('should fotmat "10.00" as "10,00 €"', () => {
    const result = formatAmountText("10.00");
    expect(result).toBe("10,00 €");
  });

  it('should format "40,25" as "40,25 €"', () => {
    const result = formatAmountText("40,25");
    expect(result).toBe("40,25 €");
  });

  it('should format "1000.1234" as "1.000,12 €"', () => {
    const result = formatAmountText("1000.1234");
    expect(result).toBe("1.000,12 €");
  });

  it('should format "1000.1" as "1.000,10 €"', () => {
    const result = formatAmountText("1000.1");
    expect(result).toBe("1.000,10 €");
  });

  it('should format "-1000.00" as "-1.000,00 €"', () => {
    const result = formatAmountText("-1000.00");
    expect(result).toBe("-1.000,00 €");
  });

  it('should format "1000,00" as "1.000,00 €"', () => {
    const result = formatAmountText("1000,00");
    expect(result).toBe("1.000,00 €");
  });

  it('should return empty string for "abcd"', () => {
    const result = formatAmountText("abcd");
    expect(result).toBe("");
  });

  it("should return empty string for empty string", () => {
    const result = formatAmountText("");
    expect(result).toBe("");
  });
});

describe("getPayerInfoLabel", () => {
  it("should return an empty string if payer is undefined", () => {
    const result = getPayerInfoLabel(undefined);
    expect(result).toBe("");
  });

  it("should return only the name if taxCode is not provided", () => {
    const payer = { name: "John Doe" } as InfoNotice["payer"];
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe");
  });

  it("should return only the taxCode if name is not provided", () => {
    const payer = { taxCode: "123456789" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("123456789");
  });

  it("should return only the taxCode if name is empty string", () => {
    const payer = { taxCode: "123456789", name: "" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("123456789");
  });

  it("should return name and taxCode formatted correctly", () => {
    const payer = { name: "John Doe", taxCode: "123456789" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe\n(123456789)");
  });

  it("should return an empty string if both name and taxCode are not provided", () => {
    const payer = {} as InfoNotice["payer"];
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("");
  });

  it("should trim extra spaces", () => {
    const payer = { name: "  John Doe  ", taxCode: "  123456789  " };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe\n(123456789)");
  });

  it("should return only the name if taxCode is empty string", () => {
    const payer = { name: "John Doe", taxCode: "" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe");
  });

  it("should return capitalize string", () => {
    const payer = { name: "john doe", taxCode: "123456789" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe\n(123456789)");
  });
});

describe("calculateTotalAmount", () => {
  it("should return undefined if transactionInfo is undefined", () => {
    const result = calculateTotalAmount(undefined);
    expect(result).toBeUndefined();
  });

  it("should return undefined if amount is not provided", () => {
    const transactionInfo = { fee: "2.50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return amount without fee if fee is not provided", () => {
    const transactionInfo = { amount: "10.00" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("10.00");
  });

  it("should return the correct total amount for valid input with dot as decimal separator", () => {
    const transactionInfo = { amount: "10.00", fee: "2.50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should return the correct total amount for valid input with comma as decimal separator", () => {
    const transactionInfo = { amount: "10,00", fee: "2,50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should handle large numbers correctly", () => {
    const transactionInfo = {
      amount: "1000000.50",
      fee: "2000000.25"
    } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("3000000.75");
  });

  it("should handle negative values correctly", () => {
    const transactionInfo = { amount: "-10.00", fee: "2.50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("-7.50");
  });

  it("should return undefined for non-numeric values", () => {
    const transactionInfo = { amount: "abc", fee: "2.50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return undefined for NaN results", () => {
    const transactionInfo = { amount: "NaN", fee: "2.50" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return undefined if amount and fee are empty strings", () => {
    const transactionInfo = { amount: "", fee: "" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should handle trailing and leading spaces in input", () => {
    const transactionInfo = { amount: " 10.00 ", fee: " 2.50 " } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should handle very small numbers", () => {
    const transactionInfo = { amount: "0.0001", fee: "0.0002" } as InfoNotice;
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("0.00");
  });
});

describe("getTransactionByIndex", () => {
  it("should return the transaction at the given index", () => {
    const transactionPot = pot.some(mockTransactions);
    expect(getTransactionByIndex(transactionPot, 1)).toEqual(
      mockTransactions[1]
    );
    expect(getTransactionByIndex(transactionPot, 2)).toEqual(
      mockTransactions[2]
    );
  });
  it("should return undefined if the index is out of bounds", () => {
    const transactionPot = pot.some(mockTransactions);
    expect(getTransactionByIndex(transactionPot, -1)).toBeUndefined();
    expect(getTransactionByIndex(transactionPot, 3)).toBeUndefined();
  });
});

describe("filterTransactionsByIdAndGetIndex", () => {
  it("should remove the transaction with the given ID and return the index", () => {
    const transactions = pot.some(mockTransactions);
    const { filteredTransactions, removedIndex } =
      filterTransactionsByIdAndGetIndex(transactions, "2");
    expect(filteredTransactions).toEqual([
      mockTransactions[0],
      mockTransactions[2]
    ]);
    expect(removedIndex).toBe(1);
  });
  it("should return the same transactions if the ID is not found", () => {
    const transactions = pot.some(mockTransactions);
    const { filteredTransactions, removedIndex } =
      filterTransactionsByIdAndGetIndex(transactions, "4");
    expect(filteredTransactions).toEqual(mockTransactions);
    expect(removedIndex).toBe(-1);
  });
  it("should return an empty array if the transactions are empty", () => {
    const transactions = pot.some([]);
    const { filteredTransactions, removedIndex } =
      filterTransactionsByIdAndGetIndex(transactions, "1");
    expect(filteredTransactions).toEqual([]);
    expect(removedIndex).toBe(-1);
  });
  it("should return an empty array if the transactions are undefined", () => {
    const transactions = pot.none;
    const { filteredTransactions, removedIndex } =
      filterTransactionsByIdAndGetIndex(transactions, "1");
    expect(filteredTransactions).toEqual([]);
    expect(removedIndex).toBe(-1);
  });
});

describe("restoreTransactionAtIndex", () => {
  it("should restore the transaction at the specified index", () => {
    const transactionPot = pot.some(mockTransactions);
    const restoreItem: NoticeListItem = {
      eventId: "4",
      amount: "40.00",
      isCart: false,
      isDebtor: false,
      isPayer: true,
      noticeDate: "2021-01-04",
      payeeTaxCode: "112233445",
      payeeName: "Alice Doe"
    };
    const index = 1;

    const restoredPot = restoreTransactionAtIndex(
      transactionPot,
      restoreItem,
      index
    );
    const restoredTransactions = pot.getOrElse(restoredPot, []);

    expect(restoredTransactions).toEqual([
      mockTransactions[0],
      restoreItem,
      mockTransactions[1],
      mockTransactions[2]
    ]);
  });

  it("should add the transaction at the end if the index is out of range", () => {
    const transactionPot = pot.some(mockTransactions);
    const restoreItem: NoticeListItem = {
      eventId: "5",
      amount: "50.00",
      isCart: false,
      isDebtor: true,
      isPayer: false,
      noticeDate: "2021-01-05",
      payeeTaxCode: "556677889",
      payeeName: "Bob Doe"
    };
    const index = 10; // Out of range

    const restoredPot = restoreTransactionAtIndex(
      transactionPot,
      restoreItem,
      index
    );
    const restoredTransactions = pot.getOrElse(restoredPot, []);

    expect(restoredTransactions).toEqual([...mockTransactions, restoreItem]);
  });

  it("should handle an empty transaction list and add the item as the only transaction", () => {
    const transactionPot = pot.some([] as ReadonlyArray<NoticeListItem>);
    const restoreItem: NoticeListItem = {
      eventId: "6",
      amount: "60.00",
      isCart: true,
      isDebtor: false,
      isPayer: false,
      noticeDate: "2021-01-06",
      payeeTaxCode: "667788990",
      payeeName: "Charlie Doe"
    };
    const index = 0;

    const restoredPot = restoreTransactionAtIndex(
      transactionPot,
      restoreItem,
      index
    );
    const restoredTransactions = pot.getOrElse(restoredPot, []);

    expect(restoredTransactions).toEqual([restoreItem]);
  });
});

describe("removeAsterisks", () => {
  it("should remove all asterisks from the input string", () => {
    expect(removeAsterisks("abc*def*ghi")).toBe("abcdefghi");
  });

  it("should return an empty string if the input is an asterisk", () => {
    expect(removeAsterisks("*")).toBe("");
  });

  it("should return an empty string if the input is an empty string", () => {
    expect(removeAsterisks("")).toBe("");
  });

  it("should return the input string if there are no asterisks", () => {
    expect(removeAsterisks("abcdefghi")).toBe("abcdefghi");
  });

  it("should return the input string if there are no characters", () => {
    expect(removeAsterisks("")).toBe("");
  });
});

describe("isValidPspName", () => {
  it("should return false if the name is undefined", () => {
    expect(isValidPspName(undefined)).toBe(false);
  });

  it('should return false if the name is "-"', () => {
    expect(isValidPspName("-")).toBe(false);
  });

  it("should return true if the name is not undefined and not equal to '-'", () => {
    expect(isValidPspName("Test PSP")).toBe(true);
  });
});
