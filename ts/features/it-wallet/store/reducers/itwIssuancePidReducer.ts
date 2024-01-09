import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { GlobalState } from "../../../../store/reducers/types";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { itwIssuancePid } from "../actions/itwIssuancePidActions";

type ItwPidIssuance = {
  pid: O.Option<StoredCredential>;
};

export type ItwIssuancePidState = pot.Pot<ItwPidIssuance, ItWalletError>;

const emptyState: ItwIssuancePidState = pot.none;

/**
 * This reducer handles the PID issuing state.
 * It manipulates a pot which maps to an error if the PID issuing faced an error.
 * A saga is attached to the request action which handles the PID issuing side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwIssuancePidState = emptyState,
  action: Action
): ItwIssuancePidState => {
  switch (action.type) {
    case getType(itwIssuancePid.request):
      return pot.toLoading(state);
    case getType(itwIssuancePid.success):
      return pot.some({
        pid: O.some(action.payload)
      });
    case getType(itwIssuancePid.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the PID pod state from the global state.
 * @param state - the global state
 * @returns the PID pot state.
 */
export const itwIssuancePidSelector = (state: GlobalState) =>
  state.features.itWallet.issuancePid;

/**
 * Selects the PID value from the global state.
 * @param state - the global state
 * @returns the pid value.
 */
export const itwIssuancePidValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.issuancePid, value => value.pid),
    O.none
  );

export default reducer;
