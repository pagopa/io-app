import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwSetFiscalCodeWhitelisted,
  itwSetReviewPending,
  itwSetWalletInstanceRemotelyActive,
  itwFreezeSimplifiedActivationRequirements,
  itwClearSimplifiedActivationRequirements,
  itwSetPidReissuingSurveyHidden,
  itwSetCredentialUpgradeFailed,
  itwDisableItwActivation
} from "../actions/preferences";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { ItwAuthLevel, StoredCredential } from "../../utils/itwTypesUtils.ts";

export type ItwPreferencesState = {
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
  // Indicates whether the user should activate IT-Wallet with the simplified flow,
  // even if he/she already has a valid L3 PID (obtained outside the whitelist)
  isItwSimplifiedActivationRequired?: boolean;
  // Indicates whether the bottom sheet survey is visible when the user quits
  // the reissuing flow only for the first time
  isPidReissuingSurveyHidden?: boolean;
  // Credential that failed to upgrade by type
  credentialUpgradeFailed?: ReadonlyArray<StoredCredential["credentialType"]>;
  // Indicates whether the IT-Wallet activation should be disabled
  // because the user's device does not support NFC
  isItwActivationDisabled?: boolean;
};

export const itwPreferencesInitialState: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = itwPreferencesInitialState,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
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

    case getType(itwSetFiscalCodeWhitelisted): {
      return {
        ...state,
        isFiscalCodeWhitelisted: action.payload
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

    case getType(itwSetPidReissuingSurveyHidden): {
      return {
        ...state,
        isPidReissuingSurveyHidden: action.payload
      };
    }
    case getType(itwSetCredentialUpgradeFailed):
      return {
        ...state,
        credentialUpgradeFailed: action.payload
      };

    case getType(itwDisableItwActivation): {
      return {
        ...state,
        isItwActivationDisabled: true
      };
    }

    case getType(itwLifecycleStoresReset):
      // When the wallet is being reset, we need to persist only the preferences:
      // - claimValuesHidden
      // - isWalletInstanceRemotelyActive: the correct value will be set in the saga related to the wallet deactivation
      // - isFiscalCodeWhitelisted: avoids to have the value undefined after a wallet reset
      // - isItwActivationDisabled: should persist across wallet resets
      const {
        claimValuesHidden,
        isWalletInstanceRemotelyActive,
        isFiscalCodeWhitelisted,
        isItwActivationDisabled
      } = state;
      return {
        ...itwPreferencesInitialState,
        claimValuesHidden,
        isWalletInstanceRemotelyActive,
        isFiscalCodeWhitelisted,
        isItwActivationDisabled
      };

    default:
      return state;
  }
};

export default reducer;
