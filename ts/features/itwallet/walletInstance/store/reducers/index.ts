import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwWalletInstanceAttestationStore,
  itwUpdateWalletInstanceStatus
} from "../actions";
import { WalletInstanceStatus } from "../../../common/utils/itwTypesUtils";

export const FAILURE_STATUS = "failure";
export type FailureStatus = typeof FAILURE_STATUS;

export type ItwWalletInstanceState = {
  attestation: string | undefined;
  status: WalletInstanceStatus | FailureStatus | undefined;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  status: undefined
};

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = -1;

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        status: undefined,
        attestation: action.payload
      };
    }

    case getType(itwUpdateWalletInstanceStatus): {
      return {
        ...state,
        status: action.payload
      };
    }

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
