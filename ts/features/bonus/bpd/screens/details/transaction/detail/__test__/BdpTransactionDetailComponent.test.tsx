// import { debug } from "console";
import * as React from "react";
import { render } from '@testing-library/react-native';
import { BpdTransactionDetailComponent } from "../BpdTransactionDetailComponent";
import { EnhancedBpdTransaction } from "../../../../../components/transactionItem/BpdTransactionItem";
import { HPan } from "../../../../../store/actions/paymentMethods";
import { AwardPeriodId } from "../../../../../store/actions/periods";

describe("Test Transaction Timestamp", () => {
  it("It should render label 'Date' and a value without hours and minutes when the transaction has a timestamp 00:00", () => {

    // TODO: test  input data should be moved in a separate file
    const myTransaction: EnhancedBpdTransaction = {
      hashPan: '0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df' as HPan,
      idTrxAcquirer: '10126487773E',
      idTrxIssuer: 'R64692',
      amount: 87.79,
      awardPeriodId: 2 as AwardPeriodId,
      image: 29,
      maxCashbackForTransactionAmount: 15,
      title: "xxxxxxx",
      trxDate: new Date('2100-12-17T00:00'),
      keyId: "xxxxxxxxx",
      cashback: 8.779,
      circuitType: 'Mastercard'
    };

    // cut : Component Under Test
    const cut = render(<BpdTransactionDetailComponent transaction={myTransaction} />);
    
    const dateLabel = cut.getByTestId("dateLabel");
    const dateValue = cut.getByTestId("dateValue");

    expect(dateLabel.children[0]).toMatch(/Date/);
    expect(dateValue.children[0]).toMatch(/17 Dec 2100/);

  });

  it("It should render label 'Date and time' and a vale woth hours and minutes when the transaction has a timestamp different from 00:00 ", () => {

    // TODO: test  input data should be moved in a separate file

    const myTransaction: EnhancedBpdTransaction = {
      hashPan: '0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df' as HPan,
      idTrxAcquirer: '10126487773E',
      idTrxIssuer: 'R64692',
      amount: 87.79,
      awardPeriodId: 2 as AwardPeriodId,
      image: 29,
      maxCashbackForTransactionAmount: 0,
      title: "xxxxxxx",
      trxDate: new Date('2100-12-17T01:00'),
      keyId: "xxxxxxxxx",
      cashback: 8.779,
      circuitType: 'Mastercard'
    };

    // cut : Component Under Test
    const cut = render(<BpdTransactionDetailComponent transaction={myTransaction} />);
    const dateLabel = cut.getByTestId("dateLabel");
    const dateValue = cut.getByTestId("dateValue");

    expect(dateLabel.children[0]).toMatch(/Date and time/);
    expect(dateValue.children[0]).toMatch(/17 Dec 2100, 01:00/);

  });
  
});