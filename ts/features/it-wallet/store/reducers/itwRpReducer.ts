import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  RequestObject,
  RpEntityConfiguration
} from "@pagopa/io-react-native-wallet/lib/typescript/rp/types";
import { Action } from "../../../../store/actions/types";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { GlobalState } from "../../../../store/reducers/types";
import { itwRpInitialization } from "../actions/itwRpActions";

export type ItwRpType = {
  requestObject: O.Option<RequestObject>;
  entity: O.Option<RpEntityConfiguration>;
};

export type ItwRpState = pot.Pot<ItwRpType, ItWalletError>;

const emptyState: ItwRpState = pot.none;

/**
 * This reducer handles the RP state.
 * It manipulates a pot which maps to an error if the RP faced an error.
 * A saga is attached to the request action which handles the RP side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwRpState = emptyState,
  action: Action
): ItwRpState => {
  switch (action.type) {
    case getType(itwRpInitialization.request):
      return pot.toLoading(state);
    case getType(itwRpInitialization.success):
      return pot.some({
        requestObject: O.some(action.payload.requestObject),
        entity: O.some(action.payload.entity)
      });
    case getType(itwRpInitialization.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Selects the RP pod state from the global state.
 * @param state - the global state
 * @returns the RP pot state.
 */
export const itwRpInitializationSelector = (state: GlobalState) =>
  state.features.itWallet.rp;

/**
 * Selects the RP value from the global state.
 * @param state - the global state
 * @returns the rp requestObject value.
 */
export const itwRpRequestObjectValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.rp, rp => rp.requestObject),
    O.none
  );

/**
 * Selects the RP entity configuration from the global state.
 * @param state - the global state
 * @returns the rp entity value.
 */
export const itwRpEntityValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.rp, rp => rp.entity),
    O.none
  );

export default reducer;
