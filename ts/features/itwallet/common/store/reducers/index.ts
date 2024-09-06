import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O from "fp-ts/lib/Option";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { combineReducers } from "redux";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../../store/actions/types";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";
import lifecycleReducer, {
  ItwLifecycleState
} from "../../../lifecycle/store/reducers";
import itwCredentialsReducer, {
  ItwCredentialsState
} from "../../../credentials/store/reducers";
import itwCreateCredentialsStorage from "../storages/itwCredentialsStorage";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { isDevEnv } from "../../../../../utils/environment";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState;
  lifecycle: ItwLifecycleState;
  credentials: ItwCredentialsState & PersistPartial;
};

export type PersistedItWalletState = ReturnType<typeof persistedReducer>;

const CURRENT_REDUX_ITW_STORE_VERSION = -1;
const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 0;
export const itwCredentialsStateMigrations: MigrationManifest = {
  "0": (state): ItwCredentialsState & PersistPartial => {
    // Version 0
    // Add optional `storedStatusAttestation` field
    const addStoredStatusAttestation = (
      credential: StoredCredential
    ): StoredCredential => ({
      ...credential,
      storedStatusAttestation: undefined
    });
    const prevState = state as ItwCredentialsState & PersistPartial;
    return {
      ...prevState,
      eid: pipe(prevState.eid, O.map(addStoredStatusAttestation)),
      credentials: prevState.credentials.map(credential =>
        pipe(credential, O.map(addStoredStatusAttestation))
      )
    };
  }
};

const itwPersistConfig: PersistConfig = {
  key: "itWallet",
  storage: AsyncStorage,
  whitelist: ["issuance", "lifecycle"] satisfies Array<keyof ItWalletState>,
  version: CURRENT_REDUX_ITW_STORE_VERSION
};

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletCredentials",
  storage: itwCreateCredentialsStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  migrate: createMigrate(itwCredentialsStateMigrations, { debug: isDevEnv })
};

const itwReducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer,
  credentials: persistReducer(
    itwCredentialsPersistConfig,
    itwCredentialsReducer
  )
});

export const persistedReducer = persistReducer<ItWalletState, Action>(
  itwPersistConfig,
  itwReducer
);

export default persistedReducer;
