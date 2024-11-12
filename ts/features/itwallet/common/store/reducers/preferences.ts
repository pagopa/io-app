import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwCloseFeedbackBanner } from "../actions/preferences";

export type ItwPreferencesState = {
  hideFeedbackBannerUntil?: Date;
};

const INITIAL_STATE: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = INITIAL_STATE,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwCloseFeedbackBanner): {
      return {
        hideFeedbackBannerUntil: addMonths(new Date(), 1)
      };
    }

    default:
      return state;
  }
};

export default reducer;
