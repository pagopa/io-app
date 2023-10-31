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
import itwRpInitializationReducer, {
  ItwRpInitializationState
} from "./itwRpInitializationReducer";
import itwRpPresentationReducer, {
  ItwRpPresentationState
} from "./itwRpPresentationReducer";
import itwCredentialsChecksReducer, {
  ItwCredentialsChecksState
} from "./itwCredentialsChecksReducer";
import itwPresentationReducer, {
  ItwPresentationState
} from "./new/itwPresentationReducer";
import itwIssuanceReducer, { ItwIssuanceState } from "./new/itwIssuanceReducer";

const CURRENT_REDUX_ITW_STORE_VERSION = 1;

export type ItWalletState = {
  wia: ItwWIAState;
  credentials: ItwCredentialsState & PersistPartial;
  credentialsChecks: ItwCredentialsChecksState;
  activation: ItwCieState;
  lifecycle: ItwLifecycleState;
  pid: ItwPidState;
  decodedPid: ItwDecodedPidState;
  rpInit: ItwRpInitializationState;
  rpPresentation: ItwRpPresentationState;
  presentation: ItwPresentationState;
  issuance: ItwIssuanceState;
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
  credentialsChecks: itwCredentialsChecksReducer,
  activation: itwCieReducer,
  lifecycle: itwLifeCycle,
  pid: itwPid,
  decodedPid: itwDecodedPid,
  rpInit: itwRpInitializationReducer,
  rpPresentation: itwRpPresentationReducer,
  presentation: itwPresentationReducer,
  issuance: itwIssuanceReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
