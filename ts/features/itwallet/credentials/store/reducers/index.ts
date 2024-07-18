import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwCredentialsRemove, itwCredentialsStore } from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { itwLifecycleWalletReset } from "../../../lifecycle/store/actions";

export type ItwCredentialsState = {
  eid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
};

const initialState: ItwCredentialsState = {
  eid: O.none,
  credentials: []
};

const reducer = (
  state: ItwCredentialsState = initialState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsStore): {
      if (action.payload.credentialType === CredentialType.PID) {
        return { eid: O.some(action.payload), credentials: [] };
      }

      if (O.isSome(state.eid)) {
        return {
          eid: state.eid,
          credentials: [...state.credentials, O.some(action.payload)]
        };
      }

      return state;
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

    case getType(itwLifecycleWalletReset):
      return { ...initialState };

    default:
      return state;
  }
};

export default reducer;
