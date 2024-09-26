import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { startApplicationInitialization } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { FIMS_SSO_ERROR_TAGS } from "../../components/FimsErrorScreens";
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
  errorTag: FIMS_SSO_ERROR_TAGS;
  standardMessage: string; // this will be deprecated
  debugMessage: string;
};

export type FimsSSOState = {
  consentsData: pot.Pot<ConsentData, FimsErrorStateType>;
  ctaText?: string;
  currentFlowState: FimsFlowStateTags;
  relyingPartyServiceId?: ServiceId;
  relyingPartyUrl?: string;
};

const INITIAL_STATE: FimsSSOState = {
  consentsData: pot.none,
  ctaText: undefined,
  currentFlowState: "idle",
  relyingPartyServiceId: undefined,
  relyingPartyUrl: undefined
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
            currentFlowState: "fastLogin_forced_restart",
            relyingPartyServiceId: undefined
          }
        : INITIAL_STATE;

    case getType(fimsGetConsentsListAction.request):
      return {
        ctaText: action.payload.ctaText,
        currentFlowState: "consents",
        consentsData: pot.noneLoading,
        relyingPartyServiceId: undefined,
        relyingPartyUrl: action.payload.ctaUrl
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        consentsData: pot.some(action.payload),
        relyingPartyServiceId: action.payload.service_id as ServiceId
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
