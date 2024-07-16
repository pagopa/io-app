import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCredentialsRemove,
  itwCredentialsStore,
  itwCredentialsWalletReset
} from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

export type ItwCredentialsState = {
  pid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
};

const initialState: ItwCredentialsState = {
  pid: O.none,
  credentials: []
};

const reducer = (
  state: ItwCredentialsState = initialState,
  action: Action
): ItwCredentialsState => {
  switch (action.type) {
    case getType(itwCredentialsStore): {
      if (action.payload.credentialType === CredentialType.PID) {
        return { pid: O.some(action.payload), credentials: [] };
      }

      if (O.isSome(state.pid)) {
        return {
          pid: state.pid,
          credentials: [...state.credentials, O.some(action.payload)]
        };
      }

      return state;
    }

    case getType(itwCredentialsRemove): {
      // Do not remove the PID singularly
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

    case getType(itwCredentialsWalletReset):
      return { ...initialState };

    default:
      return state;
  }
};

export default reducer;
