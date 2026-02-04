import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import {
  calculateTotalAmount,
  filterTransactionsByIdAndGetIndex,
  formatAmountText,
  getPayerInfoLabel,
  isValidPspName,
  mapDownloadReceiptErrorToOutcomeProps,
  removeAsterisks,
  restoreTransactionsToOriginalOrder
} from "..";
import { InfoNotice } from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { getNetworkError, NetworkError } from "../../../../../utils/errors";
import {
  DownloadReceiptOutcomeErrorEnum,
  ReceiptDownloadFailure
} from "../../types";

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

describe("filterTransactionsByIdAndGetIndex", () => {
  it("should remove the transaction with the given ID and return the indices", () => {
    const transactions = pot.some(mockTransactions);
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "2");
    expect(filteredTransactions).toEqual([
      mockTransactions[0],
      mockTransactions[2]
    ]);
    expect(removedIndices).toEqual([1]);
  });
  it("should return the same transactions if the ID is not found", () => {
    const transactions = pot.some(mockTransactions);
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "4");
    expect(filteredTransactions).toEqual(mockTransactions);
    expect(removedIndices).toEqual([]);
  });
  it("should return an empty array if the transactions are empty", () => {
    const transactions = pot.some([]);
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "1");
    expect(filteredTransactions).toEqual([]);
    expect(removedIndices).toEqual([]);
  });
  it("should return an empty array if the transactions are undefined", () => {
    const transactions = pot.none;
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "1");
    expect(filteredTransactions).toEqual([]);
    expect(removedIndices).toEqual([]);
  });
  it("should remove multiple transactions for payer cart", () => {
    const cartTransactions: ReadonlyArray<NoticeListItem> = [
      { ...mockTransactions[0], eventId: "cart-123_CART_" },
      { ...mockTransactions[1], eventId: "other" },
      { ...mockTransactions[2], eventId: "cart-123_CART_456" }
    ];
    const transactions = pot.some(cartTransactions);
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "cart-123_CART_");
    expect(filteredTransactions).toEqual([cartTransactions[1]]);
    expect(removedIndices).toEqual([0, 2]);
  });
  it("should remove only exact match for debtor cart", () => {
    const cartTransactions: ReadonlyArray<NoticeListItem> = [
      { ...mockTransactions[0], eventId: "cart-123_CART_456" },
      { ...mockTransactions[1], eventId: "other" },
      { ...mockTransactions[2], eventId: "cart-123_CART_789" }
    ];
    const transactions = pot.some(cartTransactions);
    const { filteredTransactions, removedIndices } =
      filterTransactionsByIdAndGetIndex(transactions, "cart-123_CART_456");
    expect(filteredTransactions).toEqual([
      cartTransactions[1],
      cartTransactions[2]
    ]);
    expect(removedIndices).toEqual([0]);
  });
});

describe("restoreTransactionsToOriginalOrder", () => {
  it("should restore a single removed transaction at its original index", () => {
    const filtered = [mockTransactions[0], mockTransactions[2]];
    const removedIndices = [1];
    const removedItems = [mockTransactions[1]];

    const result = restoreTransactionsToOriginalOrder(
      filtered,
      removedIndices,
      removedItems
    );

    expect(result).toEqual(mockTransactions);
  });

  it("should restore multiple removed transactions at their original indices", () => {
    const filtered = [mockTransactions[1]];
    const removedIndices = [0, 2];
    const removedItems = [mockTransactions[0], mockTransactions[2]];

    const result = restoreTransactionsToOriginalOrder(
      filtered,
      removedIndices,
      removedItems
    );

    expect(result).toEqual(mockTransactions);
  });

  it("should restore transaction at the beginning", () => {
    const filtered = [mockTransactions[1], mockTransactions[2]];
    const removedIndices = [0];
    const removedItems = [mockTransactions[0]];

    const result = restoreTransactionsToOriginalOrder(
      filtered,
      removedIndices,
      removedItems
    );

    expect(result).toEqual(mockTransactions);
  });

  it("should restore transaction at the end", () => {
    const filtered = [mockTransactions[0], mockTransactions[1]];
    const removedIndices = [2];
    const removedItems = [mockTransactions[2]];

    const result = restoreTransactionsToOriginalOrder(
      filtered,
      removedIndices,
      removedItems
    );

    expect(result).toEqual(mockTransactions);
  });

  it("should handle empty filtered list", () => {
    const filtered: ReadonlyArray<NoticeListItem> = [];
    const removedIndices = [0, 1, 2];
    const removedItems = [...mockTransactions];

    const result = restoreTransactionsToOriginalOrder(
      filtered,
      removedIndices,
      removedItems
    );

    expect(result).toEqual(mockTransactions);
  });

  it("should return same array if nothing was removed", () => {
    const result = restoreTransactionsToOriginalOrder(mockTransactions, [], []);

    expect(result).toEqual(mockTransactions);
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

describe("mapDownloadReceiptErrorToOutcomeProps", () => {
  const error_400 = {
    status: 400,
    code: DownloadReceiptOutcomeErrorEnum.GN_400_003
  } as ReceiptDownloadFailure;

  const error_404 = [
    {
      status: 404,
      code: DownloadReceiptOutcomeErrorEnum.AT_404_001
    },
    {
      status: 404,
      code: DownloadReceiptOutcomeErrorEnum.BZ_404_003
    }
  ] as Array<ReceiptDownloadFailure>;

  const defaultErrors = [
    getNetworkError(new Error("network error")),
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.UN_500_000
    },
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.GN_500_001
    },
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.GN_500_002
    },
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.GN_500_003
    },
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.GN_500_004
    },
    {
      status: 500,
      code: DownloadReceiptOutcomeErrorEnum.FG_000_001
    }
  ] as Array<NetworkError | ReceiptDownloadFailure>;

  const onCloseMock = jest.fn();
  const handleContactSupportMock = jest.fn();

  it("Should return correct outcome props for 400 error", () => {
    const result = mapDownloadReceiptErrorToOutcomeProps(
      error_400,
      onCloseMock,
      handleContactSupportMock
    );
    expect(result).toEqual({
      title: I18n.t("features.payments.transactions.receipt.error.400.title"),
      subtitle: I18n.t(
        "features.payments.transactions.receipt.error.400.subtitle"
      ),
      pictogram: "attention",
      action: {
        label: I18n.t("wallet.payment.support.supportTitle"),
        onPress: expect.any(Function)
      },
      secondaryAction: {
        label: I18n.t("global.buttons.close"),
        onPress: expect.any(Function)
      }
    });
  });

  it("Should return correct outcome props for 404 errors", () => {
    error_404.forEach(error => {
      const result = mapDownloadReceiptErrorToOutcomeProps(
        error,
        onCloseMock,
        handleContactSupportMock
      );
      expect(result).toEqual({
        title: I18n.t("features.payments.transactions.receipt.error.404.title"),
        subtitle: I18n.t(
          "features.payments.transactions.receipt.error.404.subtitle"
        ),
        pictogram: "searchLens",
        action: {
          label: I18n.t("global.buttons.close"),
          onPress: expect.any(Function)
        },
        secondaryAction: {
          label: I18n.t("wallet.payment.support.supportTitle"),
          onPress: expect.any(Function)
        }
      });
    });
  });

  it("Should return default outcome props for other cases", () => {
    defaultErrors.forEach(error => {
      const result = mapDownloadReceiptErrorToOutcomeProps(
        error,
        onCloseMock,
        handleContactSupportMock
      );
      expect(result).toEqual({
        title: I18n.t("features.payments.transactions.receipt.error.500.title"),
        subtitle: I18n.t(
          "features.payments.transactions.receipt.error.500.subtitle"
        ),
        pictogram: "umbrella",
        action: {
          label: I18n.t("global.buttons.close"),
          onPress: expect.any(Function)
        }
      });
    });
  });
});
