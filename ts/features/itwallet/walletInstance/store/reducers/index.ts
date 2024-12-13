import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { PersistConfig, persistReducer } from "redux-persist";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwWalletInstanceAttestationStore,
  itwUpdateWalletInstanceStatus
} from "../actions";
import { WalletInstanceRevocationReason } from "../../../common/utils/itwTypesUtils";

export type ItwWalletInstanceState = {
  attestation: string | undefined;
  isRevoked: boolean;
  revocationReason?: WalletInstanceRevocationReason;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  isRevoked: false,
  revocationReason: undefined
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
        isRevoked: action.payload.is_revoked,
        revocationReason: action.payload.revocation_reason
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

/* Selector to get the wallet instance status */
export const itwWalletInstanceStatusSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.walletInstance,
  walletInstance =>
    pipe(
      O.fromNullable(walletInstance.isRevoked),
      O.filter(Boolean),
      O.map(() => ({
        isRevoked: true,
        revocationReason: walletInstance.revocationReason
      })),
      O.getOrElse(() => ({ isRevoked: false }))
    )
);

export default persistedReducer;
