import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { Consent } from "../../../../../../definitions/fims_sso/Consent";
import { startApplicationInitialization } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import { shouldRestartFimsAuthAfterFastLoginFailure } from "../../utils";
import {
  fimsAcceptConsentsAction,
  fimsAcceptConsentsFailureAction,
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../actions";
import { abortUrlFromConsentsPot } from "../selectors";

export type FIMS_SSO_ERROR_TAGS =
  | "AUTHENTICATION"
  | "GENERIC"
  | "MISSING_INAPP_BROWSER";

export type FimsErrorStateType = {
  debugMessage: string;
  errorTag: FIMS_SSO_ERROR_TAGS;
};
export type FimsFlowStateTags =
  | "abort"
  | "consents"
  | "fastLogin_forced_restart"
  | "idle"
  | "in-app-browser-loading";

export type FimsSSOState = {
  ctaText?: string;
  currentFlowState: FimsFlowStateTags;
  ephemeralSessionOniOS: boolean;
  relyingPartyServiceId?: ServiceId;
  relyingPartyUrl?: string;
  ssoData: pot.Pot<Consent, FimsErrorStateType>;
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
    case getType(fimsAcceptConsentsAction):
    // falls through
    case getType(fimsSignAndRetrieveInAppBrowserUrlAction.request):
      return {
        ...state,
        currentFlowState: "in-app-browser-loading",
        ssoData: pot.none
      };
    case getType(fimsAcceptConsentsFailureAction):
    case getType(fimsGetConsentsListAction.failure):
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
    case getType(fimsSignAndRetrieveInAppBrowserUrlAction.success):
      return {
        ...state,
        currentFlowState: "idle"
      };
    case getType(startApplicationInitialization):
      return shouldRestartFimsAuthAfterFastLoginFailure(state, action)
        ? {
            ...state,
            ssoData: pot.none,
            currentFlowState: "fastLogin_forced_restart",
            relyingPartyServiceId: undefined
          }
        : INITIAL_STATE;
  }
  return state;
};

export default reducer;
