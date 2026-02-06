import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { startApplicationInitialization } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { Consent } from "../../../../../../definitions/fims_sso/Consent";
import { shouldRestartFimsAuthAfterFastLoginFailure } from "../../utils";
import {
  fimsAcceptConsentsAction,
  fimsAcceptConsentsFailureAction,
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../actions";
import { abortUrlFromConsentsPot } from "../selectors";

export type FimsFlowStateTags =
  | "idle"
  | "consents"
  | "in-app-browser-loading"
  | "abort"
  | "fastLogin_forced_restart";

export type FIMS_SSO_ERROR_TAGS =
  | "AUTHENTICATION"
  | "GENERIC"
  | "MISSING_INAPP_BROWSER";
export type FimsErrorStateType = {
  errorTag: FIMS_SSO_ERROR_TAGS;
  debugMessage: string;
};

export type FimsSSOState = {
  ssoData: pot.Pot<Consent, FimsErrorStateType>;
  ephemeralSessionOniOS: boolean;
  ctaText?: string;
  currentFlowState: FimsFlowStateTags;
  relyingPartyServiceId?: ServiceId;
  relyingPartyUrl?: string;
};

export const INITIAL_STATE: FimsSSOState = {
  ssoData: pot.none,
  ephemeralSessionOniOS: false,
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
            ssoData: pot.none,
            currentFlowState: "fastLogin_forced_restart",
            relyingPartyServiceId: undefined
          }
        : INITIAL_STATE;

    case getType(fimsGetConsentsListAction.request):
      return {
        ctaText: action.payload.ctaText,
        currentFlowState: "consents",
        ssoData: pot.noneLoading,
        relyingPartyServiceId: undefined,
        relyingPartyUrl: action.payload.ctaUrl,
        ephemeralSessionOniOS: action.payload.ephemeralSessionOniOS
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        ssoData: pot.some(action.payload),
        relyingPartyServiceId: action.payload.service_id as ServiceId
      };
    case getType(fimsAcceptConsentsAction):
    case getType(fimsSignAndRetrieveInAppBrowserUrlAction.request):
      return {
        ...state,
        currentFlowState: "in-app-browser-loading",
        ssoData: pot.none
      };
    case getType(fimsSignAndRetrieveInAppBrowserUrlAction.success):
      return {
        ...state,
        currentFlowState: "idle"
      };
    case getType(fimsGetConsentsListAction.failure):
    case getType(fimsAcceptConsentsFailureAction):
    case getType(fimsSignAndRetrieveInAppBrowserUrlAction.failure):
      return {
        ...state,
        currentFlowState: "idle",
        ssoData: pot.toError(state.ssoData, action.payload)
      };
    case getType(fimsCancelOrAbortAction):
      return pipe(
        state.ssoData,
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
