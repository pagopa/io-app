import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwCredentialsChecks } from "../actions/itwCredentialsActions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { CredentialCatalogAvailableItem } from "../../utils/mocks";

export type ItwCredentialsChecksState = pot.Pot<
  O.Option<CredentialCatalogAvailableItem>,
  ItWalletError
>;

const emptyState: ItwCredentialsChecksState = pot.none;

/**
 * This reducer handles the checks state before adding a new credentials.
 * Currently it handles a mocked credential.
 * A saga is attached to the itwCredentialsChecks action which handles the required checks.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwCredentialsChecksState = emptyState,
  action: Action
): ItwCredentialsChecksState => {
  switch (action.type) {
    case getType(itwCredentialsChecks.request):
      return pot.toLoading(state);
    case getType(itwCredentialsChecks.success):
      return pot.some(O.some(action.payload));
    case getType(itwCredentialsChecks.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the credentials state of the wallet.
 * @param state - the global state
 * @returns the credentials pot state of the wallet.
 */
export const ItwCredentialsChecksSelector = (state: GlobalState) =>
  state.features.itWallet.credentialsChecks;

/**
 * Selects the checked credential which is going to be added to the wallet.
 * @param state - the global state
 * @returns an Option containing the checked credential.
 */
export const ItwCredentialsCheckCredentialSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.credentialsChecks, O.none);

export default reducer;
