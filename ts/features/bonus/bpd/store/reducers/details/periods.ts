import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isDefined } from "../../../../../../utils/guards";
import { BpdAmount } from "../../../saga/networking/amount";
import { bpdUnsubscribeCompleted } from "../../actions/onboarding";
import {
  AwardPeriodId,
  BpdPeriod,
  bpdPeriodsAmountLoad,
  WithAwardPeriodId
} from "../../actions/periods";
import { BpdPivotTransaction } from "./transactionsv2/entities";

// The ranking is ready for a specific period
export type BpdRankingReady = WithAwardPeriodId & {
  kind: "ready";
  // total number of citizens enrolled in bpd
  totalParticipants: number;
  // ranking position of the citizen for the specified period
  ranking: number;
  // number of first-ranked transactions
  maxTransactionNumber: number;
  // number of last-ranked transactions
  minTransactionNumber: number;
  // number of transactions made by the citizen for the period
  transactionNumber: number;
  // new v2 field, containing the trx pivot information
  pivot?: BpdPivotTransaction;
};

// The ranking is still not ready for a period (eg. a period is just started
// and no transaction has been recorded)
// TODO: we should move all the types definition in the /types/* instead that in the state /action
export type BpdRankingNotReady = WithAwardPeriodId & { kind: "notReady" };

export const bpdRankingNotReady = (
  awardPeriodId: AwardPeriodId
): BpdRankingNotReady => ({
  awardPeriodId,
  kind: "notReady"
});

export type BpdRanking = BpdRankingReady | BpdRankingNotReady;

export const isBpdRankingReady = (r: BpdRanking): r is BpdRankingReady =>
  r.kind === "ready";

export const isBpdRankingNotReady = (r: BpdRanking): r is BpdRankingNotReady =>
  r.kind === "notReady";

/**
 * Combine the period & amount
 */
export type BpdPeriodWithInfo = BpdPeriod & {
  amount: BpdAmount;
  ranking: BpdRanking;
};

/**
 * A temporary implementation, based on the actual date
 * TODO: remove this method when the new state "Waiting" will be ready
 * @param period
 */
export const isGracePeriod = (period: BpdPeriod) => {
  if (period.status === "Active" || period.status === "Inactive") {
    return false;
  }
  const today = new Date();
  const endGracePeriod = new Date(period.endDate);
  endGracePeriod.setDate(period.endDate.getDate() + period.gracePeriod);
  // we are still in the grace period and warns the user that some transactions
  // may still be pending
  return today <= endGracePeriod && today >= period.endDate;
};

/**
 * Store all the cashback periods with amounts
 * @param state
 * @param action
 */
export const bpdPeriodsReducer = (
  state: pot.Pot<IndexedById<BpdPeriodWithInfo>, Error> = pot.none,
  action: Action
): pot.Pot<IndexedById<BpdPeriodWithInfo>, Error> => {
  switch (action.type) {
    case getType(bpdPeriodsAmountLoad.request):
      return pot.toLoading(state);
    case getType(bpdPeriodsAmountLoad.success):
      return pot.some(
        action.payload.reduce(
          (acc: IndexedById<BpdPeriodWithInfo>, curr: BpdPeriodWithInfo) => ({
            ...acc,
            [curr.awardPeriodId]: curr
          }),
          {}
        )
      );
    case getType(bpdPeriodsAmountLoad.failure):
      return pot.toError(state, action.payload);
    case getType(bpdUnsubscribeCompleted):
      return pot.none;
  }

  return state;
};

/**
 * Return the pot.Pot for IndexedById<BpdPeriod>, memoized to avoid recalculations
 */
export const bpdPeriodsSelector = createSelector(
  [(state: GlobalState) => state.bonus.bpd.details.periods],
  (potValue): pot.Pot<ReadonlyArray<BpdPeriodWithInfo>, Error> =>
    pot.map(potValue, potValue => Object.values(potValue).filter(isDefined))
);

/**
 * Raw selector for a specific period (if exists)
 * @param state
 * @param id
 */
const bpdPeriodByIdRawSelector = (
  state: GlobalState,
  id: AwardPeriodId
): pot.Pot<BpdPeriodWithInfo | undefined, Error> =>
  pot.map(state.bonus.bpd.details.periods, periodList => periodList[id]);

/**
 * Return a specific period (if exists)
 */
export const bpdPeriodByIdSelector = createSelector(
  [bpdPeriodByIdRawSelector],
  period => period
);
