import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwCloseFeedbackBanner } from "../actions/preferences";

export type ItwPreferencesState = {
  hideFeedbackBannerUntilDate?: string;
};

const INITIAL_STATE: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = INITIAL_STATE,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwCloseFeedbackBanner): {
      return {
        hideFeedbackBannerUntilDate: addMonths(new Date(), 1).toDateString()
      };
    }

    default:
      return state;
  }
};

export default reducer;
