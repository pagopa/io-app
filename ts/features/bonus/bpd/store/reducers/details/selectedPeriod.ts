import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdSelectPeriod } from "../../actions/selectedPeriod";
import { BpdPeriodWithInfo } from "./periods";

/**
 * Store the current period selected by the user (current displayed)
 * @param state
 * @param action
 */
export const bpdSelectedPeriodsReducer = (
  state: BpdPeriodWithInfo | null = null,
  action: Action
): BpdPeriodWithInfo | null => {
  switch (action.type) {
    // The user manually selected a specific period
    case getType(bpdSelectPeriod):
      return action.payload;
  }
  return state;
};

/**
 * Return current period selected by the user (current displayed)
 * TODO: if null(generic navigation to cashback), return the current period ( start_date < today < end_date )
 * if no period match the date interval, return the nearest
 */
export const bpdSelectedPeriodSelector = createSelector(
  [(state: GlobalState) => state.bonus.bpd.details.selectedPeriod],
  (period): BpdPeriodWithInfo | undefined =>
    period === null ? undefined : period
);
