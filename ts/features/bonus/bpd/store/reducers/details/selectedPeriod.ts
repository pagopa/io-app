import { NavigationActions } from "react-navigation";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import BPD_ROUTES from "../../../navigation/routes";
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
    // The user manually selected a specific period
    case getType(bpdSelectPeriod):
      return action.payload;
    // The user navigate to BpdDetailsScreen. We use the payload to update the
    // selectedPeriod based on the payload
    case NavigationActions.NAVIGATE:
      if (action.routeName === BPD_ROUTES.DETAILS) {
        return action.params?.specificPeriod ?? null;
      }
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
  period => (period === null ? undefined : period)
);
