import { BpdAmount } from "../../../saga/networking/amount";
import { AwardPeriodId } from "../../actions/periods";

export const zeroAmount: BpdAmount = {
  awardPeriodId: 2 as AwardPeriodId,
  totalCashback: 0,
  transactionNumber: 0
};

export const notEligibleAmount: BpdAmount = {
  awardPeriodId: 2 as AwardPeriodId,
  totalCashback: 10.25,
  transactionNumber: 3
};

export const eligibleAmount: BpdAmount = {
  awardPeriodId: 2 as AwardPeriodId,
  totalCashback: 83.52,
  transactionNumber: 50
};

export const eligibleMaxAmount: BpdAmount = {
  awardPeriodId: 2 as AwardPeriodId,
  totalCashback: 150,
  transactionNumber: 50
};
