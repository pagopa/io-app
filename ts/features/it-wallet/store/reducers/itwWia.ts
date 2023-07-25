import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwWiaRequest } from "../actions";
import { ItWalletError } from "../../utils/errors/itwErrors";

export type ItwWIAState = pot.Pot<string, ItWalletError>;

const emptyState: ItwWIAState = pot.none;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
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
      return pot.some(action.payload);
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
export const itwWiaSelector = (state: GlobalState) =>
  state.features.itWallet.wia;

export default reducer;
