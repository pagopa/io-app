import { combineReducers } from "redux";
import {
  MigrationManifest,
  PersistConfig,
  PersistPartial,
  PersistedState,
  createMigrate,
  persistReducer
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import createCredentialsKeychain from "../storages/credentialsKeychain";
import { isDevEnv } from "../../../../utils/environment";
import itwCieReducer, { ItwCieState } from "./itwCieReducer";
import itwWia, { ItwWIAState } from "./itwWiaReducer";
import itwCredentials, { ItwCredentialsState } from "./itwCredentialsReducer";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycleReducer";
import itwPid, { ItwPidState } from "./itwPidReducer";
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
import itwProximityReducer, { ItwProximityState } from "./itwProximityReducer";

const CURRENT_REDUX_ITW_STORE_VERSION = 3;

const itwStoreMigration: MigrationManifest = {
  /**
   * Version 2 where we reset the state due to redux state changes.
   */
  "2": (): PersistedState => undefined as unknown as PersistedState,
  /**
   * Version 3 where we reset the state due to redux state changes.
   */
  "3": (): PersistedState => undefined as unknown as PersistedState
};

const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 2;

const itwCredentialsStoreMigration: MigrationManifest = {
  /**
   * Version 2 where we reset the state due to redux state changes.
   */
  "2": (): PersistedState => undefined as unknown as PersistedState,
  /**
   * Version 2 where we reset the state due to redux state changes.
   */
  "3": (): PersistedState => undefined as unknown as PersistedState
};

export type ItWalletState = {
  wia: ItwWIAState;
  credentials: ItwCredentialsState & PersistPartial;
  credentialsChecks: ItwCredentialsChecksState;
  activation: ItwCieState;
  lifecycle: ItwLifecycleState;
  pid: ItwPidState;
  rpInit: ItwRpInitializationState;
  rpPresentation: ItwRpPresentationState;
  presentation: ItwPresentationState;
  issuance: ItwIssuanceState;
  proximity: ItwProximityState;
};

export type PersistedItWalletState = ItWalletState & PersistPartial;

const persistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  whitelist: ["lifecycle"],
  migrate: createMigrate(itwStoreMigration, { debug: isDevEnv })
};

const credentialsPersistConfig = {
  key: "credentials",
  storage: createCredentialsKeychain(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  migrate: createMigrate(itwCredentialsStoreMigration, { debug: isDevEnv })
};

const reducers = combineReducers<ItWalletState, Action>({
  wia: itwWia,
  credentials: persistReducer(credentialsPersistConfig, itwCredentials),
  credentialsChecks: itwCredentialsChecksReducer,
  activation: itwCieReducer,
  lifecycle: itwLifeCycle,
  pid: itwPid,
  rpInit: itwRpInitializationReducer,
  rpPresentation: itwRpPresentationReducer,
  presentation: itwPresentationReducer,
  issuance: itwIssuanceReducer,
  proximity: itwProximityReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
