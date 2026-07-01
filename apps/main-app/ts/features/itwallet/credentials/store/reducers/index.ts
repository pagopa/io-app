import { createMigrate, PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import createSecureStorage from "../../../../../store/storages/secureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwCredentialsRemove,
  itwCredentialsStore,
  itwCredentialsVaultMigrationComplete
} from "../actions";
import {
  CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  itwCredentialsStateMigrations
} from "./migrations";

type CredentialsRecord = {
  [credentialId: string]: CredentialMetadata;
};

export type ItwCredentialsState = {
  credentials: CredentialsRecord;
  // Credentials object before migration 8. Needed to handle migration outside of Redux Persist.
  // Should be empty once migration is complete and can be removed in a future version.
  legacyCredentials: {
    [credentialKey: string]: CredentialMetadata & { credential: string };
  };
};

export const itwCredentialsInitialState: ItwCredentialsState = {
  credentials: {},
  legacyCredentials: {}
};

const reducer = (
  state: ItwCredentialsState = itwCredentialsInitialState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsStore): {
      // Store each credential under its credentialId, overwriting any previous one. A batch
      // credential is a single entry that lists all its copies' keyTags (see CredentialMetadata).
      const credentials = action.payload.reduce<CredentialsRecord>(
        (acc, c) => ({ ...acc, [c.credentialId]: c }),
        state.credentials
      );

      return {
        ...state,
        credentials
      };
    }

    case getType(itwCredentialsRemove): {
      const credentialIdsToRemove = new Set(
        action.payload.map(c => c.credentialId)
      );

      const credentials = Object.fromEntries(
        Object.entries(state.credentials).filter(
          ([credentialId]) => !credentialIdsToRemove.has(credentialId)
        )
      );

      return {
        ...state,
        credentials
      };
    }

    case getType(itwCredentialsVaultMigrationComplete): {
      const migrated = new Set(action.payload);
      return {
        ...state,
        legacyCredentials: Object.fromEntries(
          Object.entries(state.legacyCredentials).filter(
            ([key]) => !migrated.has(key)
          )
        )
      };
    }

    case getType(itwLifecycleStoresReset):
      return { ...itwCredentialsInitialState };

    default:
      return state;
  }
};

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletCredentials",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  migrate: createMigrate(itwCredentialsStateMigrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(itwCredentialsPersistConfig, reducer);

export default persistedReducer;
