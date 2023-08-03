import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import createCredentialsKeychain from "../storages/credentialsKeychain";
import itwCieReducer, { ItwCieState } from "./cie";
import itwWia, { ItwWIAState } from "./itwWia";
import itwCredentials, { ItwCredentialsState } from "./itwCredentials";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycle";
import itwPid, { ItwPidState } from "./itwPid";
import itwDecodedPid, { ItwDecodedPidState } from "./itwPidDecode";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  wia: ItwWIAState;
  credentials: ItwCredentialsState & PersistPartial;
  activation: ItwCieState;
  lifecycle: ItwLifecycleState;
  pid: ItwPidState;
  decodedPid: ItwDecodedPidState;
};

export type PersistedItWalletState = ItWalletState & PersistPartial;

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["lifecycle"]
};

const credentialsPersistConfig = {
  key: "credentials",
  storage: createCredentialsKeychain()
};

const reducers = combineReducers<ItWalletState, Action>({
  wia: itwWia,
  credentials: persistReducer(credentialsPersistConfig, itwCredentials),
  activation: itwCieReducer,
  lifecycle: itwLifeCycle,
  pid: itwPid,
  decodedPid: itwDecodedPid
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
