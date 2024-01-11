/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import {
  itwPrRemoteCredential,
  itwPrRemoteCredentialInit
} from "../actions/itwPrRemoteCredentialActions";

/**
 * Type of the state managed by the reducer for the presentation flow.
 * Currently it only manages the checks required before starting the presentation.
 */
export type ItwPrRemoteCredentialState = {
  init: pot.Pot<boolean, ItWalletError>;
  result: pot.Pot<boolean, ItWalletError>;
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwPrRemoteCredentialState = {
  init: pot.none,
  result: pot.none
};

const reducer = (
  state: ItwPrRemoteCredentialState = EMPTY_STATE,
  action: Action
): ItwPrRemoteCredentialState => {
  switch (action.type) {
    /**
     * Presentation checks section.
     */
    case getType(itwPrRemoteCredentialInit.request):
      return {
        ...state,
        init: pot.toLoading(state.init)
      };
    case getType(itwPrRemoteCredentialInit.success):
      return {
        ...state,
        init: pot.some(true)
      };
    case getType(itwPrRemoteCredentialInit.failure):
      return {
        ...state,
        init: pot.toError(state.init, action.payload)
      };
    /**
     * Presentation request section.
     */
    case getType(itwPrRemoteCredential.request):
      return {
        ...state,
        result: pot.toLoading(state.result)
      };
    case getType(itwPrRemoteCredential.success):
      return {
        ...state,
        result: pot.some(true)
      };
    case getType(itwPrRemoteCredential.failure):
      return {
        ...state,
        result: pot.toError(state.result, action.payload)
      };
    default:
      return state;
  }
};

/**
 * Selector for the presentation init pot state.
 * @param state - the global state
 * @returns the checks state pot
 */
export const itwPrRemoteCredentialInitSelector = (state: GlobalState) =>
  state.features.itWallet.prRemoteCredential.init;

/**
 * Selector for the presentation result pot state.
 * @param state - the global state
 * @returns the checks state pot
 */
export const itwPrRemoteCredentialResultSelector = (state: GlobalState) =>
  state.features.itWallet.prRemoteCredential.result;

export default reducer;
