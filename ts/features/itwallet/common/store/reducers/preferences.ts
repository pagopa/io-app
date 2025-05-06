import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCloseDiscoveryBanner,
  itwCloseFeedbackBanner,
  itwFlagCredentialAsRequested,
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwSetFiscalCodeWhitelisted,
  itwSetL3Enabled,
  itwSetReviewPending,
  itwSetWalletInstanceRemotelyActive,
  itwUnflagCredentialAsRequested
} from "../actions/preferences";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { ItwAuthLevel } from "../../utils/itwTypesUtils.ts";

export type ItwPreferencesState = {
  // Date until which the feedback banner should be hidden
  hideFeedbackBannerUntilDate?: string;
  // Date until which the discovery banner should be hidden
  hideDiscoveryBannerUntilDate?: string;
  // Stores the list of requested credentials which supports delayed issuance
  // Each credential type is associated with a date (ISO string) which represents
  // the date of the last issuance request.
  requestedCredentials: { [credentialType: string]: string };
  // Indicates whether the user should see the modal to review the app.
  isPendingReview?: boolean;
  // Indicates the SPID/CIE authentication level used to obtain the eid
  authLevel?: ItwAuthLevel;
  // Indicates whether the claim values should be hidden in credential details
  claimValuesHidden?: boolean;
  // Indicates whether the user has an already active wallet instance
  // but the actual local wallet is not active
  isWalletInstanceRemotelyActive?: boolean;
  // TEMPORARY LOCAL FF - TO BE REPLACED WITH REMOTE FF (SIW-2195)
  // Indicates whether the L3 is enabled, which allows to use the new IT Wallet
  // features for users with L3 authentication level
  isL3Enabled?: boolean;
  // Indicates whether the fiscal code is whitelisted for L3 features
  isFiscalCodeWhitelisted?: boolean;
};

export const itwPreferencesInitialState: ItwPreferencesState = {
  requestedCredentials: {}
};

const reducer = (
  state: ItwPreferencesState = itwPreferencesInitialState,
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

    case getType(itwSetReviewPending): {
      return {
        ...state,
        isPendingReview: action.payload
      };
    }

    case getType(itwSetAuthLevel): {
      return {
        ...state,
        authLevel: action.payload
      };
    }

    case getType(itwSetClaimValuesHidden): {
      return {
        ...state,
        claimValuesHidden: action.payload
      };
    }

    case getType(itwSetWalletInstanceRemotelyActive): {
      return {
        ...state,
        isWalletInstanceRemotelyActive: action.payload
      };
    }

    case getType(itwSetL3Enabled): {
      return {
        ...state,
        isL3Enabled: action.payload
      };
    }
    case getType(itwLifecycleStoresReset):
      // When the wallet is being reset, we need to persist only the preferences:
      // - claimValuesHidden
      // - isL3Enabled
      const { claimValuesHidden, isL3Enabled } = state;
      return {
        ...itwPreferencesInitialState,
        claimValuesHidden,
        isL3Enabled
      };

    case getType(itwSetFiscalCodeWhitelisted): {
      return {
        ...state,
        isFiscalCodeWhitelisted: action.payload
      };
    }

    default:
      return state;
  }
};

export default reducer;
