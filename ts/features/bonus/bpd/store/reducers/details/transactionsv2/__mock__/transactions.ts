import { WinningTransactionMilestoneResource } from "../../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionMilestoneResource";
import { AwardPeriodId, WithAwardPeriodId } from "../../../../actions/periods";

export const awardPeriodTemplate: WithAwardPeriodId = {
  awardPeriodId: 1 as AwardPeriodId
};

export const transactionTemplate: WinningTransactionMilestoneResource = {
  awardPeriodId: awardPeriodTemplate.awardPeriodId,
  idTrx: "1",
  idTrxIssuer: "idTrxIssuer",
  idTrxAcquirer: "idTrxIssuer",
  cashback: 15,
  hashPan: "hPan",
  circuitType: "01",
  trxDate: new Date("2021-01-01"),
  amount: 150
};
