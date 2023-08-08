import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { itwWiaRequest } from "../actions/itwWiaActions";

export type ItwWIAState = pot.Pot<O.Option<string>, ItWalletError>;

const emptyState: ItwWIAState = pot.none;

/**
 * This reducer handles the WIA issuing state.
 * It manipulates a pot which maps to an error if the WIA issuing faced an error.
 * A saga is attached to the request action which handles the WIA issuing side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwWIAState = emptyState,
  action: Action
): ItwWIAState => {
  switch (action.type) {
    case getType(itwWiaRequest.request):
      return pot.toLoading(state);
    case getType(itwWiaRequest.success):
      return pot.some(O.some(action.payload));
    case getType(itwWiaRequest.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the wallet instance attestation state.
 * @param state the global state
 * @returns the wallet instance attestation state
 */
export const itwWiaStateSelector = (state: GlobalState) =>
  state.features.itWallet.wia;

/**
 * Selects the wallet instance attestation value.
 * @param state the global state
 * @returns the wallet instance attestation value
 */
export const itwWiaSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.wia, O.none);

export default reducer;
