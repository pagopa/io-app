import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { BpdPeriod } from "../../actions/periods";
import { bpdSelectPeriod } from "../../actions/selectedPeriod";

/**
 * Store the current period selected by the user (current displayed)
 * @param state
 * @param action
 */
export const bpdSelectedPeriodsReducer = (
  state: BpdPeriod | null = null,
  action: Action
): BpdPeriod | null => {
  switch (action.type) {
    case getType(bpdSelectPeriod):
      return action.payload;
  }
  return state;
};

/**
 * Return current period selected by the user (current displayed)
 */
export const bpdSelectedPeriodSelector = createSelector(
  [(state: GlobalState) => state.bonus.bpd.details.selectedPeriod],
  period => (period === null ? undefined : period)
);
