import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwRequirementsRequest } from "../actions";
import { ItWalletError } from "../../utils/errors/itwErrors";

export type ItwRequirementsState = pot.Pot<true, ItWalletError>;

const emptyState: ItwRequirementsState = pot.none;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwRequirementsState = emptyState,
  action: Action
): ItwRequirementsState => {
  switch (action.type) {
    case getType(itwRequirementsRequest.request):
      return pot.toLoading(state);
    case getType(itwRequirementsRequest.success):
      return pot.some(action.payload);
    case getType(itwRequirementsRequest.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the itwRequirements state.
 * @param state the global state
 * @returns the itwRequirements state
 */
export const itwRequirementsSelector = (state: GlobalState) =>
  state.features.itWallet.itwRequirements;

export default reducer;
