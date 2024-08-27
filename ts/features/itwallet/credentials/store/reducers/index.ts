import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwCredentialsRemove,
  itwCredentialsStore,
  itwCredentialsMultipleUpdate
} from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { itwLifecycleWalletReset } from "../../../lifecycle/store/actions";

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

    case getType(itwCredentialsMultipleUpdate): {
      const credentialUpdatesByType = action.payload.reduce(
        (acc, c) => ({ ...acc, [c.credentialType]: c }),
        {} as { [K in CredentialType]?: Partial<StoredCredential> }
      );
      return {
        ...state,
        credentials: state.credentials.map(
          O.map(c => {
            const updates =
              credentialUpdatesByType[c.credentialType as CredentialType];
            return updates ? { ...c, ...updates } : c;
          })
        )
      };
    }

    case getType(itwLifecycleWalletReset):
      return { ...itwCredentialsInitialState };

    default:
      return state;
  }
};

export default reducer;
