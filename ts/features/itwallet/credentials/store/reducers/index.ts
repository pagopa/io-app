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

type CredentialsRecord = { [credentialKey: string]: CredentialMetadata };

export type ItwCredentialsState = {
  credentials: CredentialsRecord;
};

export const itwCredentialsInitialState: ItwCredentialsState = {
  credentials: {}
};

const reducer = (
  state: ItwCredentialsState = itwCredentialsInitialState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsStore): {
      const addedCredentials = action.payload.reduce(
        (acc, c) => ({ ...acc, [c.credentialId]: c }),
        {} as CredentialsRecord
      );

      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...addedCredentials
        }
      };
    }

    case getType(itwCredentialsRemove): {
      const idsToRemove = new Set(action.payload.map(c => c.credentialId));

      const otherCredentials = Object.values(state.credentials)
        .filter(c => !idsToRemove.has(c.credentialId))
        .reduce(
          (acc, c) => ({ ...acc, [c.credentialId]: c }),
          {} as CredentialsRecord
        );

      return {
        ...state,
        credentials: otherCredentials
      };
    }

    case getType(itwCredentialsVaultMigrationComplete): {
      // Destructure out `credential` explicitly rather than trusting the action
      // type, because at runtime the objects coming from legacy Redux state may
      // still carry the field even though CredentialMetadata doesn't declare it.
      const migratedCredentials = action.payload.reduce((acc, entry) => {
        const { credential: _credential, ...metadata } =
          entry as CredentialMetadata & { credential?: string };
        return {
          ...acc,
          [metadata.credentialId]: metadata as CredentialMetadata
        };
      }, {} as CredentialsRecord);

      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...migratedCredentials
        }
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
