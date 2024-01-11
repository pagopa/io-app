import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwPersistedCredentialsStore } from "../actions/itwPersistedCredentialsActions";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { itwLifecycleOperational } from "../actions/itwLifecycleActions";
import { CredentialType } from "../../utils/itwMocksUtils";

export type ItwPersistedCredentialsState = {
  pid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
};

const emptyState: ItwPersistedCredentialsState = {
  pid: O.none,
  credentials: []
};

/**
 * This reducer handles the credentials state.
 * Currently it only handles adding the PID to the wallet.
 * A saga is attached to the itwPersistedCredentialsStorePid action which handles the PID issuing.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwPersistedCredentialsState = emptyState,
  action: Action
): ItwPersistedCredentialsState => {
  switch (action.type) {
    case getType(itwPersistedCredentialsStore):
      if (action.payload.credentialType === CredentialType.PID) {
        return { credentials: [], pid: O.some(action.payload) }; // Reset the credential array when a new PID is added
      } else {
        if (O.isSome(state.pid)) {
          return {
            pid: state.pid,
            credentials: [...state.credentials, O.some(action.payload)]
          };
        } else {
          return state; // If the PID is not present, the credential is not added
        }
      }

    /**
     * Reset the state when the wallet is operational.
     */
    case getType(itwLifecycleOperational):
      return emptyState;
  }
  return state;
};

/**
 * Selects the credentials state of the wallet.
 * @param state - the global state
 * @returns the credentials pot state of the wallet.
 */
export const itwPersistedCredentialsSelector = (state: GlobalState) =>
  state.features.itWallet.credentials;

/**
 * Selects the PID stored in the wallet.
 * @param state - the global state
 * @returns the PID from the wallet.
 */
export const itwPersistedCredentialsValuePidSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.pid;

/**
 * Selects the credentials stored in the wallet.
 * @param state - the global state
 * @returns the credentials array from the wallet or an empty array if the pot is empty.
 */
export const itwPersistedCredentialsValueSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.credentials;

export default reducer;
