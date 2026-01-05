import { createMigrate, PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwCredentialsRemove, itwCredentialsStore } from "../actions";
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
      const idsToRemove = new Set(action.payload);

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

    case getType(itwLifecycleStoresReset):
      return { ...itwCredentialsInitialState };

    default:
      return state;
  }
};

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletCredentials",
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  migrate: createMigrate(itwCredentialsStateMigrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(itwCredentialsPersistConfig, reducer);

export default persistedReducer;
