import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { ConsentData } from "../../types";
import { shouldRestartFimsAuthAfterFastLoginFailure } from "../../utils";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../actions";
import { abortUrlFromConsentsPot } from "../selectors";

export type FimsFlowStateTags =
  | "idle"
  | "consents"
  | "in-app-browser-loading"
  | "abort"
  | "fastLogin_forced_restart";

export type FimsErrorStateType = {
  standardMessage: string;
  debugMessage: string;
};

export type FimsSSOState = {
  currentFlowState: FimsFlowStateTags;
  consentsData: pot.Pot<ConsentData, FimsErrorStateType>;
  relyingPartyUrl?: string;
};

const INITIAL_STATE: FimsSSOState = {
  currentFlowState: "idle",
  relyingPartyUrl: undefined,
  consentsData: pot.none
};

const reducer = (
  state: FimsSSOState = INITIAL_STATE,
  action: Action
): FimsSSOState => {
  switch (action.type) {
    case getType(startApplicationInitialization):
      return shouldRestartFimsAuthAfterFastLoginFailure(state, action)
        ? {
            ...state,
            consentsData: pot.none,
            currentFlowState: "fastLogin_forced_restart"
          }
        : INITIAL_STATE;

    case getType(fimsGetConsentsListAction.request):
      return {
        currentFlowState: "consents",
        consentsData: pot.noneLoading,
        relyingPartyUrl: action.payload.ctaUrl
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        consentsData: pot.some(action.payload)
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.request):
      return {
        ...state,
        currentFlowState: "in-app-browser-loading",
        consentsData: pot.none
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.success):
      return {
        ...state,
        currentFlowState: "idle"
      };
    case getType(fimsGetConsentsListAction.failure):
    case getType(fimsGetRedirectUrlAndOpenIABAction.failure):
      return {
        ...state,
        currentFlowState: "idle",
        consentsData: pot.toError(state.consentsData, action.payload)
      };
    case getType(fimsCancelOrAbortAction):
      return pipe(
        state.consentsData,
        abortUrlFromConsentsPot,
        O.foldW(
          () => ({ ...state, currentFlowState: "idle" }),
          () => ({ ...state, currentFlowState: "abort" })
        )
      );
  }
  return state;
};

export default reducer;
