import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../../store/actions/types";
import {
  itwCredentialsRemove,
  itwCredentialsStore,
  itwCredentialsMultipleUpdate
} from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";

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
      if (action.payload.credentialType === CredentialType.PID) {
        return { eid: O.some(action.payload), credentials: [] };
      }

      if (O.isNone(state.eid)) {
        return state;
      }

      return {
        eid: state.eid,
        credentials: getUpsertedCredentials(state.credentials, action.payload)
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

    case getType(itwCredentialsMultipleUpdate): {
      const credentialsToUpdateByType = action.payload.reduce(
        (acc, c) => ({ ...acc, [c.credentialType]: c }),
        {} as { [K in CredentialType]?: StoredCredential }
      );
      return {
        ...state,
        credentials: state.credentials.map(
          O.map(c => {
            const updatedCredential =
              credentialsToUpdateByType[c.credentialType as CredentialType];
            return updatedCredential ?? c;
          })
        )
      };
    }

    case getType(itwLifecycleStoresReset):
      return { ...itwCredentialsInitialState };

    default:
      return state;
  }
};

/**
 * Get the new list of credentials overwriting those of the same type, if present.
 */
const getUpsertedCredentials = (
  credentials: ItwCredentialsState["credentials"],
  newCredential: StoredCredential
): ItwCredentialsState["credentials"] => {
  const credentialAlreadyExists =
    credentials.findIndex(credential =>
      pipe(
        credential,
        O.map(x => x.credentialType === newCredential.credentialType),
        O.getOrElse(() => false)
      )
    ) !== -1;

  if (credentialAlreadyExists) {
    return credentials.map(credential =>
      pipe(
        credential,
        O.map(x =>
          x.credentialType === newCredential.credentialType ? newCredential : x
        )
      )
    );
  }

  return [...credentials, O.some(newCredential)];
};

export default reducer;
