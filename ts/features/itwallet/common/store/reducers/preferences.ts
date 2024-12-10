import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCloseDiscoveryBanner,
  itwCloseFeedbackBanner
} from "../actions/preferences";

export type ItwPreferencesState = {
  hideFeedbackBannerUntilDate?: string;
  hideDiscoveryBannerUntilDate?: string;
};

const INITIAL_STATE: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = INITIAL_STATE,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwCloseFeedbackBanner): {
      return {
        ...state,
        hideFeedbackBannerUntilDate: addMonths(new Date(), 1).toISOString()
      };
    }

    case getType(itwCloseDiscoveryBanner): {
      return {
        ...state,
        hideDiscoveryBannerUntilDate: addMonths(new Date(), 6).toISOString()
      };
    }

    default:
      return state;
  }
};

export default reducer;
