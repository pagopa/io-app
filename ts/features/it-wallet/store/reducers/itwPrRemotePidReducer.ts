import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { GlobalState } from "../../../../store/reducers/types";
import {
  itwPrRemotePidInit,
  itwPrRemotePidPresentation
} from "../actions/itwPrRemotePidActions";
import {
  RequestObject,
  RpEntityConfiguration
} from "../../utils/itwTypesUtils";

/**
 * Type for the result of the initialization process.
 */
export type ItwPrRemotePidInit = {
  requestObject: RequestObject;
  rpEntityConfiguration: RpEntityConfiguration;
};

/**
 * Type fo the result of the pid presentation process.
 */
export type ItwPrRemotePidResult = {
  status: string;
  response_code?: string;
};

export type ItwPrRemotePidState = {
  init: pot.Pot<O.Option<ItwPrRemotePidInit>, ItWalletError>;
  result: pot.Pot<O.Option<ItwPrRemotePidResult>, ItWalletError>;
};

const emptyState: ItwPrRemotePidState = {
  init: pot.none,
  result: pot.none
};

/**
 * This reducer handles the RP state.
 * It manipulates a pot which maps to an error if the RP faced an error.
 * A saga is attached to the request action which handles the RP side effects.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwPrRemotePidState = emptyState,
  action: Action
): ItwPrRemotePidState => {
  switch (action.type) {
    /**
     * INIT
     */
    case getType(itwPrRemotePidInit.request):
      return {
        init: pot.toLoading(state.init),
        result: pot.none
      };
    case getType(itwPrRemotePidInit.success):
      return {
        ...state,
        init: pot.some(O.some(action.payload))
      };
    case getType(itwPrRemotePidInit.failure):
      return {
        ...state,
        init: pot.toError(state.init, action.payload)
      };

    /**
     * RESULT
     */
    case getType(itwPrRemotePidPresentation.request):
      return {
        ...state,
        result: pot.toLoading(state.result)
      };
    case getType(itwPrRemotePidPresentation.success):
      return {
        ...state,
        result: pot.some(O.some(action.payload))
      };
    case getType(itwPrRemotePidPresentation.failure):
      return {
        ...state,
        result: pot.toError(state.result, action.payload)
      };
  }
  return state;
};

/**
 * Selects the PID remote presentation init pot from the global state.
 * @param state - the global state
 * @returns a pot representing the init process state
 */
export const itwPrRemotePidInitSelector = (state: GlobalState) =>
  state.features.itWallet.prRemotePid.init;

/**
 * Selects the PID remote presentation init pot from the global state.
 * @param state - the global state
 * @returns a pot representing the init process state
 */
export const itwPrRemotePidInitValueSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.prRemotePid.init, O.none);

/**
 * Selects the PID remote presentation result pot from the global state.
 * @param state - the global state
 * @returns a pot representing the remote presentation result process state
 */
export const itwPrRemotePidResultSelector = (state: GlobalState) =>
  state.features.itWallet.prRemotePid.result;

export default reducer;
