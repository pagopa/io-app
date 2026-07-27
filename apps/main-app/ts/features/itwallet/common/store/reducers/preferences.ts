import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { IdentificationContext } from "../../../machine/eid/context.ts";
import { CredentialMetadata, ItwAuthLevel } from "../../utils/itwTypesUtils.ts";
import {
  itwClearCredentialUpgradeFailed,
  itwClearWalletActivationFeedbackBannerData,
  itwDisableItwActivation,
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwSetCredentialUpgradeFailed,
  itwSetFiscalCodeWhitelisted,
  itwSetIdentificationMode,
  itwSetPidReissuingSurveyHidden,
  itwSetWalletActivationFeedbackBannerData,
  ItwWalletActivationFeedbackBannerData
} from "../actions/preferences";

export type ItwPreferencesState = {
  // Indicates the SPID/CIE authentication level used to obtain the eid
  authLevel?: ItwAuthLevel;
  // Indicates whether the claim values should be hidden in credential details
  claimValuesHidden?: boolean;
  // Credential that failed to upgrade by type
  credentialUpgradeFailed?: ReadonlyArray<CredentialMetadata["credentialType"]>;
  // Indicates the identification mode used for the user
  identificationMode?: IdentificationContext["mode"];
  // Indicates whether the fiscal code is whitelisted for L3 features
  isFiscalCodeWhitelisted?: boolean;
  // Indicates whether the IT-Wallet activation should be disabled
  // because the user's device does not support NFC
  isItwActivationDisabled?: boolean;
  // Indicates whether the bottom sheet survey is visible when the user quits
  // the reissuing flow only for the first time
  isPidReissuingSurveyHidden?: boolean;
  // Set when a credential is successfully added together with an IT Wallet eID activation.
  // Used to show the credential success survey banner in WALLET_HOME for 7 days.
  walletActivationFeedbackBannerData?: ItwWalletActivationFeedbackBannerData;
};

export const itwPreferencesInitialState: ItwPreferencesState = {};

const reducer = (
  state: ItwPreferencesState = itwPreferencesInitialState,
  action: Action
): ItwPreferencesState => {
  switch (action.type) {
    case getType(itwClearCredentialUpgradeFailed):
      return {
        ...state,
        credentialUpgradeFailed: state.credentialUpgradeFailed?.filter(
          type => type !== action.payload
        )
      };

    case getType(itwClearWalletActivationFeedbackBannerData): {
      const { walletActivationFeedbackBannerData: _, ...rest } = state;
      return rest;
    }

    case getType(itwDisableItwActivation): {
      return {
        ...state,
        isItwActivationDisabled: true
      };
    }

    case getType(itwLifecycleStoresReset):
      // When the wallet is being reset, we need to persist only the preferences:
      // - claimValuesHidden
      // - isFiscalCodeWhitelisted: avoids to have the value undefined after a wallet reset
      // - isItwActivationDisabled: should persist across wallet resets
      const {
        claimValuesHidden,
        isFiscalCodeWhitelisted,
        isItwActivationDisabled
      } = state;
      return {
        ...itwPreferencesInitialState,
        claimValuesHidden,
        isFiscalCodeWhitelisted,
        isItwActivationDisabled
      };

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

    case getType(itwSetCredentialUpgradeFailed):
      return {
        ...state,
        credentialUpgradeFailed: action.payload
      };

    case getType(itwSetFiscalCodeWhitelisted): {
      return {
        ...state,
        isFiscalCodeWhitelisted: action.payload
      };
    }

    case getType(itwSetIdentificationMode): {
      return {
        ...state,
        identificationMode: action.payload
      };
    }

    case getType(itwSetPidReissuingSurveyHidden): {
      return {
        ...state,
        isPidReissuingSurveyHidden: action.payload
      };
    }

    case getType(itwSetWalletActivationFeedbackBannerData): {
      return {
        ...state,
        walletActivationFeedbackBannerData: action.payload
      };
    }

    default:
      return state;
  }
};

export default reducer;
