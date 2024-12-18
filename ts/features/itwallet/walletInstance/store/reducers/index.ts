import * as O from "fp-ts/lib/Option";
import { flow } from "fp-ts/lib/function";
import { PersistConfig, persistReducer } from "redux-persist";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwUpdateWalletInstanceStatus,
  itwWalletInstanceAttestationStore
} from "../actions";
import { WalletInstanceStatus } from "../../../common/utils/itwTypesUtils";

export const UNKNOWN_STATUS = "unknown";
export type UnknownStatus = typeof UNKNOWN_STATUS;

export type ItwWalletInstanceState = {
  attestation: string | undefined;
  status: WalletInstanceStatus | UnknownStatus | undefined;
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
        ...state,
        attestation: action.payload
      };
    }

    case getType(itwUpdateWalletInstanceStatus):
      return {
        ...state,
        status: action.payload
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

export const itwWalletInstanceAttestationSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.attestation;

export const itwIsWalletInstanceAttestationValidSelector = createSelector(
  itwWalletInstanceAttestationSelector,
  flow(
    O.fromNullable,
    O.map(isWalletInstanceAttestationValid),
    O.getOrElse(() => false)
  )
);

/**
 * Returns true when it was not possible to retrieve the wallet instance status,
 * for instance because of unexpected errors.
 */
export const itwIsWalletInstanceStatusUnknownSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.status === UNKNOWN_STATUS;

export default persistedReducer;
