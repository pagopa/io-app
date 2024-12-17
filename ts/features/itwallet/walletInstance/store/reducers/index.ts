import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwWalletInstanceAttestationStore,
  itwUpdateWalletInstanceStatus,
  itwWalletInstanceSetAlertShown
} from "../actions";
import { WalletInstanceRevocationReason } from "../../../common/utils/itwTypesUtils";

export type ItwWalletInstanceState = {
  attestation: string | undefined;
  revocation: {
    isRevoked: boolean;
    alertShown: boolean;
    revocationReason?: WalletInstanceRevocationReason;
  };
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  revocation: {
    isRevoked: false,
    alertShown: false,
    revocationReason: undefined
  }
};

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = -1;

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        ...state,
        attestation: action.payload
      };
    }

    case getType(itwUpdateWalletInstanceStatus): {
      return {
        ...state,
        revocation: {
          ...state.revocation,
          isRevoked: action.payload.is_revoked,
          revocationReason: action.payload.revocation_reason
        }
      };
    }

    case getType(itwWalletInstanceSetAlertShown):
      return {
        ...state,
        revocation: {
          ...state.revocation,
          alertShown: true
        }
      };

    case getType(itwLifecycleStoresReset):
      return { ...itwWalletInstanceInitialState };

    default:
      return state;
  }
};

const itwWalletInstancePersistConfig: PersistConfig = {
  key: "itwWalletInstance",
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION
};

const persistedReducer = persistReducer(
  itwWalletInstancePersistConfig,
  reducer
);

export default persistedReducer;
