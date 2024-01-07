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
import itwIssuancePidAuthCieReducer, {
  ItwIssuancePidCieAuthState
} from "./issuance/pid/itwIssuancePidCieAuthReducer";
import itwWia, { ItwWiaState } from "./itwWiaReducer";
import itwCredentials, { ItwCredentialsState } from "./itwCredentialsReducer";
import itwLifeCycle, { ItwLifecycleState } from "./itwLifecycleReducer";
import itwPidReducer, {
  ItwIssuancePidState
} from "./issuance/pid/itwIssuancePidReducer";
import itwPrRemotePidReducer, {
  ItwPrRemotePidState
} from "./presentation/remote/itwPrRemotePidReducer";
import itwCredentialsChecksReducer, {
  ItwCredentialsChecksState
} from "./itwCredentialsChecksReducer";
import itwPrRemoteCredentialReducer, {
  itwPrRemoteCredentialState
} from "./presentation/remote/itwPrRemoteCredentialReducer";
import itwIssuanceCredentialReducer, {
  ItwIssuanceCredentialState
} from "./issuance/itwIssuanceCredentialReducer";
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
  /* GENERIC */
  lifecycle: ItwLifecycleState;
  wia: ItwWiaState;
  /* ISSUANCE */
  issuancePidCie: ItwIssuancePidCieAuthState;
  issuancePid: ItwIssuancePidState;
  issuanceCredential: ItwIssuanceCredentialState;
  /* PERSISTED CREDENTIALS */
  credentials: ItwCredentialsState & PersistPartial;
  credentialsChecks: ItwCredentialsChecksState;
  /* PRESENTATION REMOTE */
  prRemotePid: ItwPrRemotePidState;
  prRemoteCredential: itwPrRemoteCredentialState;
  /* PRESENTATION PROXIMITY */
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
  /* GENERIC */
  lifecycle: itwLifeCycle,
  wia: itwWia,
  /* ISSUANCE */
  issuancePidCie: itwIssuancePidAuthCieReducer,
  issuancePid: itwPidReducer,
  issuanceCredential: itwIssuanceCredentialReducer,
  /* PERSISTED CREDENTIALS */
  credentials: persistReducer(credentialsPersistConfig, itwCredentials),
  credentialsChecks: itwCredentialsChecksReducer,
  /* PRESENTATION REMOTE */
  prRemotePid: itwPrRemotePidReducer,
  prRemoteCredential: itwPrRemoteCredentialReducer,
  /* PRESENTATION PROXIMITY */
  proximity: itwProximityReducer
});

const itwReducer = persistReducer<ItWalletState, Action>(
  persistConfig,
  reducers
);

export default itwReducer;
