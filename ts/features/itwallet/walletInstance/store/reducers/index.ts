import { WalletInstanceAttestation } from "@pagopa/io-react-native-wallet";
import { flow } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PersistConfig, persistReducer } from "redux-persist";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwWalletInstanceAttestationStore } from "../actions";

export type ItwWalletInstanceState = {
  attestation: O.Option<string>;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: O.none
};

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = -1;

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        attestation: O.some(action.payload)
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

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param state - the root state of the Redux store
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const itwShouldRequestAttestationSelector = createSelector(
  itwWalletInstanceAttestationSelector,
  flow(
    O.map(attestation => {
      const { payload } = WalletInstanceAttestation.decode(attestation);
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      return now > expiryDate;
    }),
    O.getOrElse(() => true)
  )
);

export default persistedReducer;
