// import { debug } from "console";
import { render } from "@testing-library/react-native";
import * as React from "react";
import I18n from "../../../../../../../../i18n";
import { HPan } from "../../../../../store/actions/paymentMethods";
import { AwardPeriodId } from "../../../../../store/actions/periods";
import {
  BpdTransactionDetailComponent,
  BpdTransactionDetailRepresentation
} from "../BpdTransactionDetailComponent";

const baseTransaction: BpdTransactionDetailRepresentation = {
  hashPan:
    "0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df" as HPan,
  idTrxAcquirer: "10126487773E",
  idTrxIssuer: "R64692",
  amount: 87.79,
  awardPeriodId: 2 as AwardPeriodId,
  image: 29,
  maxCashbackForTransactionAmount: 15,
  title: "xxxxxxx",
  trxDate: new Date("2100-12-17T00:00"),
  keyId: "xxxxxxxxx",
  cashback: 8.779,
  circuitType: "Mastercard / Maestro",
  validForCashback: true
};

describe("Test Transaction Timestamp", () => {
  it("It should render label 'Date' and a value without hours and minutes when the transaction has a timestamp 00:00", () => {
    const myTransaction: BpdTransactionDetailRepresentation = {
      hashPan:
        "0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df" as HPan,
      idTrxAcquirer: "10126487773E",
      idTrxIssuer: "R64692",
      amount: 87.79,
      awardPeriodId: 2 as AwardPeriodId,
      image: 29,
      maxCashbackForTransactionAmount: 15,
      title: "xxxxxxx",
      trxDate: new Date("2100-12-17T00:00"),
      keyId: "xxxxxxxxx",
      cashback: 8.779,
      circuitType: "Mastercard / Maestro",
      validForCashback: true
    };

    // cut : Component Under Test
    const cut = render(
      <BpdTransactionDetailComponent transaction={myTransaction} />
    );

    const dateLabel = cut.getByTestId("dateLabel");
    const dateValue = cut.getByTestId("dateValue");

    expect(dateLabel.children[0]).toMatch(/Date/);
    expect(dateValue.children[0]).toMatch(/17 Dec 2100/);
  });

  it("It should render label 'Date and time' and a value with hours and minutes when the transaction has a timestamp different from 00:00 ", () => {
    const myTransaction: BpdTransactionDetailRepresentation = {
      hashPan:
        "0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df" as HPan,
      idTrxAcquirer: "10126487773E",
      idTrxIssuer: "R64692",
      amount: 87.79,
      awardPeriodId: 2 as AwardPeriodId,
      image: 29,
      maxCashbackForTransactionAmount: 0,
      title: "xxxxxxx",
      trxDate: new Date("2100-12-17T01:00"),
      keyId: "xxxxxxxxx",
      cashback: 8.779,
      circuitType: "Mastercard / Maestro",
      validForCashback: true
    };

    // cut : Component Under Test
    const cut = render(
      <BpdTransactionDetailComponent transaction={myTransaction} />
    );
    const dateLabel = cut.getByTestId("dateLabel");
    const dateValue = cut.getByTestId("dateValue");

    expect(dateLabel.children[0]).toMatch(/Date and time/);
    expect(dateValue.children[0]).toMatch(/17 Dec 2100, 01:00/);
  });
});

describe("Test BpdTransactionDetailComponent warnings", () => {
  describe("It should render warning 'max cashback for transaction' when maxCashbackForTransactionAmount === cashback", () => {
    const maxAmount = 15.01;
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: maxAmount,
        maxCashbackForTransactionAmount: maxAmount,
        validForCashback: true
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t("bonus.bpd.details.transaction.detail.maxCashbackWarning", {
          amount: maxAmount
        })
      );
      expect(warningTest).not.toBeNull();
    });
  });

  describe("It shouldn't render warning 'max cashback for transaction' when maxCashbackForTransactionAmount !== cashback", () => {
    const maxAmount = 15.01;
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: maxAmount,
        maxCashbackForTransactionAmount: maxAmount - 0.01,
        validForCashback: true
      },
      {
        ...baseTransaction,
        cashback: maxAmount,
        maxCashbackForTransactionAmount: 0,
        validForCashback: false
      },
      {
        ...baseTransaction,
        cashback: maxAmount,
        maxCashbackForTransactionAmount: maxAmount,
        validForCashback: false
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t("bonus.bpd.details.transaction.detail.maxCashbackWarning", {
          amount: maxAmount
        })
      );
      expect(warningTest).toBeNull();
    });
  });

  describe("It should render warning 'canceledOperationWarning' when cashback value < 0", () => {
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: -0.01,
        validForCashback: true
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t("bonus.bpd.details.transaction.detail.canceledOperationWarning")
      );
      expect(warningTest).not.toBeNull();
    });
  });
  describe("It shouldn't render warning 'canceledOperationWarning' when cashback value >= 0", () => {
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: 0,
        validForCashback: true
      },
      {
        ...baseTransaction,
        cashback: 5,
        validForCashback: false
      },
      {
        ...baseTransaction,
        cashback: -5,
        validForCashback: false
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t("bonus.bpd.details.transaction.detail.canceledOperationWarning")
      );
      expect(warningTest).toBeNull();
    });
  });
  describe("It should render warning 'maxCashbackForPeriodWarning' when validForCashback === false", () => {
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: 0,
        validForCashback: false
      },
      {
        ...baseTransaction,
        cashback: 10.5,
        validForCashback: false
      },
      {
        ...baseTransaction,
        cashback: -10.5,
        validForCashback: false
      },
      {
        ...baseTransaction,
        cashback: 15,
        maxCashbackForTransactionAmount: 15,
        validForCashback: false
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t(
          "bonus.bpd.details.transaction.detail.maxCashbackForPeriodWarning"
        )
      );
      expect(warningTest).not.toBeNull();
    });
  });
  describe("It shouldn't render warning 'maxCashbackForPeriodWarning'", () => {
    const testCases: ReadonlyArray<BpdTransactionDetailRepresentation> = [
      {
        ...baseTransaction,
        cashback: 0,
        validForCashback: true
      }
    ];

    test.each(testCases)("Test case: %p", transaction => {
      const component = render(
        <BpdTransactionDetailComponent transaction={transaction} />
      );

      const warningTest = component.queryByText(
        I18n.t(
          "bonus.bpd.details.transaction.detail.maxCashbackForPeriodWarning"
        )
      );
      expect(warningTest).toBeNull();
    });
  });
});
