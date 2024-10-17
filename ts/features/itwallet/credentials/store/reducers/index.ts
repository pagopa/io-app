import * as O from "fp-ts/lib/Option";
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
  eid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
};

export const itwCredentialsInitialState: ItwCredentialsState = {
  eid: O.none,
  credentials: []
};

const reducer = (
  state: ItwCredentialsState = itwCredentialsInitialState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsStore): {
      const { [CredentialType.PID]: eid, ...otherCredentials } =
        action.payload.reduce(
          (acc, c) => ({ ...acc, [c.credentialType]: c }),
          {} as { [K in CredentialType]?: StoredCredential }
        );

      // Can't add other credentials when there is no eID
      if (!eid && O.isNone(state.eid)) {
        return state;
      }

      return {
        eid: eid ? O.some(eid) : state.eid,
        credentials: getUpsertedCredentials(state.credentials, otherCredentials)
      };
    }

    case getType(itwCredentialsRemove): {
      // Do not remove the eID singularly
      if (action.payload.credentialType === CredentialType.PID) {
        return state;
      }

      return {
        ...state,
        credentials: state.credentials.filter(
          x =>
            O.isSome(x) &&
            x.value.credentialType !== action.payload.credentialType
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
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION,
  migrate: createMigrate(itwCredentialsStateMigrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(itwCredentialsPersistConfig, reducer);

/**
 * Get the new list of credentials overwriting those of the same type, if present.
 */
const getUpsertedCredentials = (
  credentials: ItwCredentialsState["credentials"],
  newCredentials: { [K in CredentialType]?: StoredCredential }
): ItwCredentialsState["credentials"] => {
  const originalCredentials = credentials.reduce(
    (acc, credentialOption) =>
      O.isSome(credentialOption)
        ? {
            ...acc,
            [credentialOption.value.credentialType]: credentialOption.value
          }
        : acc,
    {} as Record<CredentialType, StoredCredential>
  );

  return Object.values({ ...originalCredentials, ...newCredentials }).map(
    O.some
  );
};

export default persistedReducer;
