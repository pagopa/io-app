import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import createCredentialsKeychain from "../storages/credentialsKeychain";
import itwCieReducer, { ItwCieState } from "./itwCieReducer";
import itwWia, { ItwWIAState } from "./itwWiaReducer";
import itwCredentials, { ItwCredentialsState } from "./itwCredentialsReducer";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycleReducer";
import itwPid, { ItwPidState } from "./itwPidReducer";
import itwDecodedPid, { ItwDecodedPidState } from "./itwPidDecodeReducer";
import itwRp, { ItwRpState } from "./itwRpReducer";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  wia: ItwWIAState;
  credentials: ItwCredentialsState & PersistPartial;
  activation: ItwCieState;
  lifecycle: ItwLifecycleState;
  pid: ItwPidState;
  decodedPid: ItwDecodedPidState;
  rp: ItwRpState;
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
  decodedPid: itwDecodedPid,
  rp: itwRp
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
