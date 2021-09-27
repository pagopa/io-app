import { getSubtitle } from "../BpdTransactionItem";
import { EnhancedBpdTransaction } from "../../../components/transactionItem/BpdTransactionItem";
import { HPan } from "../../../store/actions/paymentMethods";
import { AwardPeriodId } from "../../../store/actions/periods";

describe("Test how the transaction subtitle changes with different timestamps", () => {
  it("Subtitle shouldn't contain hours and minutes, when the transaction has a timestamp 00:00", () => {
    const myTransaction: EnhancedBpdTransaction = {
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
      circuitType: "Mastercard / Maestro"
    };

    expect(getSubtitle(myTransaction)).toMatch("€ 87.79 · 17 Dec ");
  });

  it("Subtitle should contain hours and minutes when the transaction has a timestamp 00:00", () => {
    const myTransaction: EnhancedBpdTransaction = {
      hashPan:
        "0d4194712c5d820fcbbb2e7ba199e15f73cfd43f8fe49f0aa62e7901253506df" as HPan,
      idTrxAcquirer: "10126487773E",
      idTrxIssuer: "R64692",
      amount: 100000.79,
      awardPeriodId: 2 as AwardPeriodId,
      image: 29,
      maxCashbackForTransactionAmount: 15,
      title: "xxxxxxx",
      trxDate: new Date("2100-12-19T12:39"),
      keyId: "xxxxxxxxx",
      cashback: 8.779,
      circuitType: "Mastercard / Maestro"
    };

    expect(getSubtitle(myTransaction)).toMatch("€ 100,000.79 · 19 Dec, 12:39 ");
  });
});
