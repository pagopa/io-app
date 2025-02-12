import * as O from "fp-ts/lib/Option";
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
import lifecycleReducer, {
  ItwLifecycleState
} from "../../../lifecycle/store/reducers";
import wiaReducer, {
  ItwWalletInstanceState
} from "../../../walletInstance/store/reducers";
import { StoredCredential } from "../../utils/itwTypesUtils.ts";
import preferencesReducer, { ItwPreferencesState } from "./preferences";

export type ItWalletState = {
  issuance: ItwIssuanceState & PersistPartial;
  lifecycle: ItwLifecycleState;
  credentials: ItwCredentialsState & PersistPartial;
  walletInstance: ItwWalletInstanceState & PersistPartial;
  preferences: ItwPreferencesState;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const itwReducer = combineReducers({
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer,
  credentials: itwCredentialsReducer,
  walletInstance: wiaReducer,
  preferences: preferencesReducer
});

const CURRENT_REDUX_ITW_STORE_VERSION = 2;

const migrations: MigrationManifest = {
  // Added preferences store
  "0": (state: PersistedState): PersistedState =>
    _.set(state, "preferences", {}),

  // Added requestedCredentials to preferences store
  "1": (state: PersistedState): PersistedState =>
    _.set(state, "preferences.requestedCredentials", {}),

  // Added authLevel to preferences store and set it to "L2" if eid is present
  "2": (state: PersistedState): PersistedState => {
    const eid: O.Option<StoredCredential> = _.get(state, "credentials.eid");

    // If eid is a Some(value), set authLevel to "L2"
    if (eid && O.isSome(eid)) {
      return _.set(state, "preferences.authLevel", "L2");
    }

    return state;
  }
};

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["lifecycle", "preferences"] satisfies Array<keyof ItWalletState>,
  version: CURRENT_REDUX_ITW_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;
