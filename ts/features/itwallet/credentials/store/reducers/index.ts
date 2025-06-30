import { createMigrate, PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwCredentialsRemove, itwCredentialsStore } from "../actions";
import {
  CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  itwCredentialsStateMigrations
} from "./migrations";

export type ItwCredentialsState = {
  credentials: { [credentialKey: string]: StoredCredential };
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
      const credentialsByType = action.payload.reduce(
        (acc, c) => ({ ...acc, [c.credentialType]: c }),
        {} as { [K in CredentialType]?: StoredCredential }
      );

      // Can't add other credentials when there is no eID
      if (
        credentialsByType[CredentialType.PID] === undefined &&
        state.credentials[CredentialType.PID] === undefined
      ) {
        return state;
      }

      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...credentialsByType
        }
      };
    }

    case getType(itwCredentialsRemove): {
      // Do not remove the eID singularly
      if (action.payload.credentialType === CredentialType.PID) {
        return state;
      }

      const { [action.payload.credentialType]: _, ...otherCredentials } =
        state.credentials;
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
