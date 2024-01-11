import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { itwWiaRequest } from "../actions/itwWiaActions";
import { itwLifecycleOperational } from "../actions/itwLifecycleActions";

export type ItwWiaState = pot.Pot<O.Option<string>, ItWalletError>;

const emptyState: ItwWiaState = pot.none;

/**
 * This reducer handles the WIA issuing state.
 * It manipulates a pot which maps to an error if the WIA issuing faced an error.
 * A saga is attached to the request action which handles the WIA issuing side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwWiaState = emptyState,
  action: Action
): ItwWiaState => {
  switch (action.type) {
    case getType(itwWiaRequest.request):
      return pot.toLoading(state);
    case getType(itwWiaRequest.success):
      return pot.some(O.some(action.payload));
    case getType(itwWiaRequest.failure):
      return pot.toError(state, action.payload);
    /**
     * Reset the state when the wallet is operational.
     */
    case getType(itwLifecycleOperational):
      return emptyState;
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
