import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import createCredentialsKeychain from "../storages/keychain";
import itwCieReducer, { ItwCieState } from "./cie";
import itwWia, { ItwWIAState } from "./itwWia";
import itwAttestations, { ItwAttestationsState } from "./itwCredentials";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycle";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  wia: ItwWIAState;
  attestations: ItwAttestationsState & PersistPartial;
  activation: ItwCieState;
  lifecycle: ItwLifecycleState;
};

export type PersistedItWalletState = ItWalletState & PersistPartial;

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["lifecycle"]
};

const attestationsPersistConfig = {
  key: "attestations",
  storage: createCredentialsKeychain()
};

const reducers = combineReducers<ItWalletState, Action>({
  wia: itwWia,
  attestations: persistReducer(attestationsPersistConfig, itwAttestations),
  activation: itwCieReducer,
  lifecycle: itwLifeCycle
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
