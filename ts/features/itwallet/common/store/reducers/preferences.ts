import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCloseDiscoveryBanner,
  itwCloseFeedbackBanner,
  itwFlagCredentialAsRequested,
  itwUnflagCredentialAsRequested
} from "../actions/preferences";

export type ItwPreferencesState = {
  // Date until which the feedback banner should be hidden
  hideFeedbackBannerUntilDate?: string;
  // Date until which the discovery banner should be hidden
  hideDiscoveryBannerUntilDate?: string;
  // Stores the list of requested credentials which supports delayed issuance
  // Each credential type is associated with a date (ISO string) which represents
  // the date of the last issuance request.
  requestedCredentials: { [credentialType: string]: string };
};

const INITIAL_STATE: ItwPreferencesState = {
  requestedCredentials: {}
};

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

    case getType(itwFlagCredentialAsRequested): {
      return {
        ...state,
        requestedCredentials: {
          ...state.requestedCredentials,
          [action.payload]: new Date().toISOString()
        }
      };
    }

    case getType(itwUnflagCredentialAsRequested): {
      if (action.payload in state.requestedCredentials) {
        const { [action.payload]: _, ...requestedCredentials } =
          state.requestedCredentials;

        return {
          ...state,
          requestedCredentials
        };
      }
      return state;
    }

    default:
      return state;
  }
};

export default reducer;
