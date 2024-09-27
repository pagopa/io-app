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
import { itwWiaStore } from "../actions";

export type ItwWiaState = {
  attestation: O.Option<string>;
};

export const itwWiaInitialState: ItwWiaState = {
  attestation: O.none
};

const CURRENT_REDUX_ITW_WIA_STORE_VERSION = -1;

const reducer = (
  state: ItwWiaState = itwWiaInitialState,
  action: Action
): ItwWiaState => {
  switch (action.type) {
    case getType(itwWiaStore): {
      return {
        attestation: O.some(action.payload)
      };
    }

    case getType(itwLifecycleStoresReset):
      return { ...itwWiaInitialState };

    default:
      return state;
  }
};

const itwWalletInstanceAttestationPersistConfig: PersistConfig = {
  key: "itwWalletInstanceAttestation",
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_WIA_STORE_VERSION
};

const persistedReducer = persistReducer(
  itwWalletInstanceAttestationPersistConfig,
  reducer
);

export const itwSelectWalletInstanceAttestation = (state: GlobalState) =>
  state.features.itWallet.wia.attestation;

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param state - the root state of the Redux store
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const itwShouldRequestAttestationSelector = createSelector(
  itwSelectWalletInstanceAttestation,
  flow(
    O.map(attestation => {
      const { payload } = WalletInstanceAttestation.decode(attestation);
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      return now > expiryDate;
    }),
    O.getOrElse(() => false)
  )
);

export default persistedReducer;
