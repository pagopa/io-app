import { addMonths } from "date-fns";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCloseDiscoveryBanner,
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwSetFiscalCodeWhitelisted,
  itwSetReviewPending,
  itwSetWalletInstanceRemotelyActive,
  itwSetWalletUpgradeMDLDetailsBannerHidden,
  itwFreezeSimplifiedActivationRequirements,
  itwClearSimplifiedActivationRequirements
} from "../actions/preferences";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { ItwAuthLevel } from "../../utils/itwTypesUtils.ts";

export type ItwPreferencesState = {
  // Date until which the discovery banner should be hidden
  hideDiscoveryBannerUntilDate?: string;
  // Indicates whether the user should see the modal to review the app.
  isPendingReview?: boolean;
  // Indicates the SPID/CIE authentication level used to obtain the eid
  authLevel?: ItwAuthLevel;
  // Indicates whether the claim values should be hidden in credential details
  claimValuesHidden?: boolean;
  // Indicates whether the user has an already active wallet instance
  // but the actual local wallet is not active
  isWalletInstanceRemotelyActive?: boolean;
  // Indicates whether the fiscal code is whitelisted for L3 features
  isFiscalCodeWhitelisted?: boolean;
  // Indicates whether the IT-wallet upgrade banner in MDL details should be hidden
  walletUpgradeMDLDetailsBannerHidden?: boolean;
  // Indicates whether the user should activate IT-Wallet with the simplified flow,
  // even if he/she already has a valid L3 PID (obtained outside the whitelist)
  isItwSimplifiedActivationRequired?: boolean;
};

export const itwPreferencesInitialState: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = itwPreferencesInitialState,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwCloseDiscoveryBanner): {
      return {
        ...state,
        hideDiscoveryBannerUntilDate: addMonths(new Date(), 6).toISOString()
      };
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

    case getType(itwLifecycleStoresReset):
      // When the wallet is being reset, we need to persist only the preferences:
      // - claimValuesHidden
      // - isWalletInstanceRemotelyActive: the correct value will be set in the saga related to the wallet deactivation
      // - isFiscalCodeWhitelisted: avoids to have the value undefined after a wallet reset
      const {
        claimValuesHidden,
        isWalletInstanceRemotelyActive,
        isFiscalCodeWhitelisted
      } = state;
      return {
        ...itwPreferencesInitialState,
        claimValuesHidden,
        isWalletInstanceRemotelyActive,
        isFiscalCodeWhitelisted
      };

    case getType(itwSetFiscalCodeWhitelisted): {
      return {
        ...state,
        isFiscalCodeWhitelisted: action.payload
      };
    }

    case getType(itwSetWalletUpgradeMDLDetailsBannerHidden): {
      return {
        ...state,
        walletUpgradeMDLDetailsBannerHidden: action.payload
      };
    }

    case getType(itwFreezeSimplifiedActivationRequirements):
      return {
        ...state,
        isItwSimplifiedActivationRequired:
          state.authLevel === "L3" && !state.isFiscalCodeWhitelisted
      };

    case getType(itwClearSimplifiedActivationRequirements): {
      const { isItwSimplifiedActivationRequired: _, ...rest } = state;
      return rest;
    }

    default:
      return state;
  }
};

export default reducer;
