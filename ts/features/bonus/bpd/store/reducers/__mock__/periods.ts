import {
  AwardPeriodId,
  BpdPeriod,
  WithAwardPeriodId
} from "../../actions/periods";

export const closedPeriod: BpdPeriod = {
  awardPeriodId: 0 as AwardPeriodId,
  minTransactionNumber: 50,
  maxPeriodCashback: 150,
  gracePeriod: 5,
  startDate: new Date("2020-10-01"),
  endDate: new Date("2020-10-31"),
  cashbackPercentage: 0.1,
  maxTransactionCashback: 10,
  minPosition: 100000,
  status: "Closed",
  superCashbackAmount: 1500
};

export const activePeriod: BpdPeriod = {
  awardPeriodId: 1 as AwardPeriodId,
  minTransactionNumber: 50,
  maxPeriodCashback: 150,
  gracePeriod: 5,
  startDate: new Date("2020-11-01"),
  endDate: new Date("2020-11-30"),
  cashbackPercentage: 0.1,
  maxTransactionCashback: 10,
  minPosition: 100000,
  status: "Active",
  superCashbackAmount: 1500
};

export const inactivePeriod: BpdPeriod = {
  awardPeriodId: 2 as AwardPeriodId,
  minTransactionNumber: 50,
  maxPeriodCashback: 150,
  gracePeriod: 5,
  startDate: new Date("2021-01-01"),
  endDate: new Date("2021-06-30"),
  cashbackPercentage: 0.1,
  maxTransactionCashback: 10,
  minPosition: 100000,
  status: "Inactive",
  superCashbackAmount: 1500
};

export const withAwardPeriodId = <T extends WithAwardPeriodId>(
  value: T,
  newId: AwardPeriodId
): T => ({ ...value, awardPeriodId: newId });
