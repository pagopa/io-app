import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { GlobalState } from "../../../../store/reducers/types";
import { itwRpPresentation } from "../actions/itwRpActions";

export type ItwRpPresentationType = {
  result: O.Option<{
    status: string;
    response_code?: string;
  }>;
};

export type ItwRpPresentationState = pot.Pot<
  ItwRpPresentationType,
  ItWalletError
>;

const emptyState: ItwRpPresentationState = pot.none;

/**
 * This reducer handles the RP presentation state.
 * It manipulates a pot which maps to an error if the RP faced an error.
 * A saga is attached to the request action which handles the RP presentation flow.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwRpPresentationState = emptyState,
  action: Action
): ItwRpPresentationState => {
  switch (action.type) {
    case getType(itwRpPresentation.request):
      return pot.toLoading(state);
    case getType(itwRpPresentation.success):
      return pot.some({
        result: O.some(action.payload)
      });
    case getType(itwRpPresentation.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the RP presentation pod state from the global state.
 * @param state - the global state
 * @returns the RP presentation pot state.
 */
export const itwRpPresentationSelector = (state: GlobalState) =>
  state.features.itWallet.rpPresentation;

/**
 * Selects the RP presentation result value from the global state.
 * @param state - the global state
 * @returns the RP presentation result string value or a none Option if unavailable.
 */
export const itwRpPresentationResultSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.rpPresentation,
      rpPresentation => rpPresentation.result
    ),
    O.none
  );

export default reducer;
