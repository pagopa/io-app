/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItWalletError } from "../../../utils/itwErrorsUtils";
import {
  itwPresentation,
  itwPresentationChecks
} from "../../actions/new/itwPresentationActions";

/**
 * Type of the state managed by the reducer for the presentation flow.
 * Currently it only manages the checks required before starting the presentation.
 */
export type ItwPresentationState = {
  checks: pot.Pot<boolean, ItWalletError>;
  presentation: pot.Pot<boolean, ItWalletError>;
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwPresentationState = {
  checks: pot.none,
  presentation: pot.none
};

const reducer = (
  state: ItwPresentationState = EMPTY_STATE,
  action: Action
): ItwPresentationState => {
  switch (action.type) {
    /**
     * Presentation checks section.
     */
    case getType(itwPresentationChecks.request):
      return {
        ...state,
        checks: pot.toLoading(state.checks)
      };
    case getType(itwPresentationChecks.success):
      return {
        ...state,
        checks: pot.some(true)
      };
    case getType(itwPresentationChecks.failure):
      return {
        ...state,
        checks: pot.toError(state.checks, action.payload)
      };
    /**
     * Presentation request section.
     */
    case getType(itwPresentation.request):
      return {
        ...state,
        presentation: pot.toLoading(state.presentation)
      };
    case getType(itwPresentation.success):
      return {
        ...state,
        presentation: pot.some(true)
      };
    case getType(itwPresentation.failure):
      return {
        ...state,
        presentation: pot.toError(state.presentation, action.payload)
      };
    default:
      return state;
  }
};

/**
 * Selector for the presentation checks pot state.
 * @param state - the global state
 * @returns the checks state pot
 */
export const itwPresentationChecksSelector = (state: GlobalState) =>
  state.features.itWallet.presentation.checks;

export const itwPresentationResultSelector = (state: GlobalState) =>
  state.features.itWallet.presentation.presentation;

export default reducer;
