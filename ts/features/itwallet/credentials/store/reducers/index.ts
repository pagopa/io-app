import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCredentialsRemove,
  itwCredentialsStore,
  itwIpzsHasReadPolicy
} from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";

export type ItwCredentialsState = {
  eid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
  hasReadIPZSPolicy: boolean;
};

export const itwCredentialsInitialState: ItwCredentialsState = {
  eid: O.none,
  credentials: [],
  hasReadIPZSPolicy: false
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
        ...state,
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
    case getType(itwIpzsHasReadPolicy):
      return {
        ...state,
        hasReadIPZSPolicy: action.payload
      };
    default:
      return state;
  }
};

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

export default reducer;
