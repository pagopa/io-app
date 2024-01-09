import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";

import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  itwPersistedCredentialsAdd,
  itwPersistedCredentialsAddPid
} from "../actions/itwPersistedCredentialsActions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { itwLifecycleOperational } from "../actions/itwLifecycleActions";

/**
 * The type of credentials stored in the wallet.
 * The PID is a particular credential which is stored separately.
 */
type ItwPersistedCredentials = {
  pid: O.Option<StoredCredential>;
  credentials: Array<O.Option<StoredCredential>>;
};

export type ItwPersistedCredentialsState = pot.Pot<
  ItwPersistedCredentials,
  ItWalletError
>;

const emptyState: ItwPersistedCredentialsState = pot.none;

/**
 * This reducer handles the credentials state.
 * Currently it only handles adding the PID to the wallet.
 * A saga is attached to the itwPersistedCredentialsAddPid action which handles the PID issuing.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwPersistedCredentialsState = emptyState,
  action: Action
): ItwPersistedCredentialsState => {
  switch (action.type) {
    /**
     * PID related actions, will be merged with generic credentials in the future.
     */
    case getType(itwPersistedCredentialsAddPid.request):
      return pot.toLoading(state);
    case getType(itwPersistedCredentialsAddPid.success):
      return pot.some({ credentials: [], pid: O.some(action.payload) }); // credentials is always empty when adding a PID
    case getType(itwPersistedCredentialsAddPid.failure):
      return pot.toError(state, action.payload);
    /**
     * Credentials related actions.
     */
    case getType(itwPersistedCredentialsAdd.success):
      return pot.some({
        pid: pot.getOrElse(
          pot.map(state, credentials => credentials.pid),
          O.none // TODO: this should never happen, but we should handle it
        ),
        credentials: [
          ...pot.getOrElse(
            pot.map(state, credentials => credentials.credentials),
            []
          ),
          O.some(action.payload)
        ]
      });
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
  pot.getOrElse(
    pot.map(
      state.features.itWallet.credentials,
      credentials => credentials.pid
    ),
    O.none
  );

/**
 * Selects the credentials stored in the wallet.
 * @param state - the global state
 * @returns the credentials array from the wallet or an empty array if the pot is empty.
 */
export const itwPersistedCredentialsValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.credentials,
      credentials => credentials.credentials
    ),
    []
  );

export default reducer;
