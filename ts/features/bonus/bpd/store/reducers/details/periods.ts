import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isDefined } from "../../../../../../utils/guards";
import {
  AwardPeriodId,
  BpdPeriod,
  bpdPeriodsLoad
} from "../../actions/periods";

/**
 * Store all the cashback periods
 * @param state
 * @param action
 */
export const bpdPeriodsReducer = (
  state: pot.Pot<IndexedById<BpdPeriod>, Error> = pot.none,
  action: Action
): pot.Pot<IndexedById<BpdPeriod>, Error> => {
  switch (action.type) {
    case getType(bpdPeriodsLoad.request):
      return pot.toLoading(state);
    case getType(bpdPeriodsLoad.success):
      return pot.some(
        action.payload.reduce(
          (acc: IndexedById<BpdPeriod>, curr: BpdPeriod) => ({
            ...acc,
            [curr.awardPeriodId]: curr
          }),
          pot.getOrElse(state, {})
        )
      );
    case getType(bpdPeriodsLoad.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};

/**
 * Return the pot.Pot for IndexedById<BpdPeriod>, memoized to avoid recalculations
 */
export const bpdPeriodsSelector = createSelector(
  [(state: GlobalState) => state.bonus.bpd.details.periods],
  potValue =>
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
): pot.Pot<BpdPeriod | undefined, Error> =>
  pot.map(state.bonus.bpd.details.periods, periodList => periodList[id]);

/**
 * Return a specific period (if exists)
 */
export const bpdPeriodByIdSelector = createSelector(
  [bpdPeriodByIdRawSelector],
  period => period
);
