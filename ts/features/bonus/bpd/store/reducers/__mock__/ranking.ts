import { AwardPeriodId } from "../../actions/periods";
import { BpdRankingNotReady, BpdRankingReady } from "../details/periods";

export const notReadyRanking: BpdRankingNotReady = {
  awardPeriodId: 0 as AwardPeriodId,
  kind: "notReady"
};

export const readyRanking: BpdRankingReady = {
  kind: "ready",
  awardPeriodId: 1 as AwardPeriodId,
  maxTransactionNumber: 150,
  minTransactionNumber: 0,
  ranking: 1500,
  totalParticipants: 30000,
  transactionNumber: 5
};
