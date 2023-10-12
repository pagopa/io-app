import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwAddCredential } from "../actions/itwCredentialsActions";
import { ItWalletError } from "../../utils/errors/itwErrors";

export type ItwAddCredentialState = pot.Pot<boolean, ItWalletError>;

const emptyState: ItwAddCredentialState = pot.none;

/**
 * This reducer handles the checks state before adding a new credentials.
 * Currently it handles a mocked credential.
 * A saga is attached to the itwCredentialsChecks action which handles the required checks.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwAddCredentialState = emptyState,
  action: Action
): ItwAddCredentialState => {
  switch (action.type) {
    case getType(itwAddCredential.request):
      return pot.toLoading(state);
    case getType(itwAddCredential.success):
      return pot.some(action.payload);
    case getType(itwAddCredential.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Select the credential result.
 * @param state - the global state
 * @returns the credential pot state of the adding op.
 */
export const itwAddCredentialSelector = (state: GlobalState) =>
  state.features.itWallet.credential;

/**
 * Selects the checked credential which is going to be added to the wallet.
 * @param state - the global state
 * @returns an Option containing the checked credential.
 */
export const itwAddCredentialStateSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.credential, false);

export default reducer;
