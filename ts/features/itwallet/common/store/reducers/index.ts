import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { combineReducers } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import itwCredentialsReducer, {
  ItwCredentialsState
} from "../../../credentials/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";
import wiaReducer, {
  ItwWalletInstanceState
} from "../../../walletInstance/store/reducers";
import preferencesReducer, { ItwPreferencesState } from "./preferences";

export type ItWalletState = {
  issuance: ItwIssuanceState & PersistPartial;
  credentials: ItwCredentialsState & PersistPartial;
  walletInstance: ItwWalletInstanceState & PersistPartial;
  preferences: ItwPreferencesState;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const itwReducer = combineReducers({
  issuance: issuanceReducer,
  credentials: itwCredentialsReducer,
  walletInstance: wiaReducer,
  preferences: preferencesReducer
});

const CURRENT_REDUX_ITW_STORE_VERSION = 3;

export const migrations: MigrationManifest = {
  // Added preferences store
  "0": (state: PersistedState): PersistedState =>
    _.set(state, "preferences", {}),

  // Added requestedCredentials to preferences store
  "1": (state: PersistedState): PersistedState =>
    _.set(state, "preferences.requestedCredentials", {}),

  // Added authLevel to preferences store and set it to "L2" if eid is present
  "2": (state: PersistedState): PersistedState => {
    const lifecycle = _.get(state, "lifecycle");
    // If the lifecycle is valid that means we have an eid, set the authLevel to "L2"
    const authLevel = lifecycle === "ITW_LIFECYCLE_VALID" ? "L2" : undefined;
    return _.set(state, "preferences.authLevel", authLevel);
  },
  // Removed lifecycle reducer
  "3": (state: PersistedState): PersistedState => _.omit(state, "lifecycle")
};

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["preferences"] satisfies Array<keyof ItWalletState>,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;
