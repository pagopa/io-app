import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../actions";
import { ConsentData } from "../../types";
import { isStrictNone } from "../../../../../utils/pot";

type FimsFlowStateTags = "consents" | "in-app-browser" | "abort";

export type FimsSSOState = {
  currentFlowState: FimsFlowStateTags;
  consentsData: pot.Pot<ConsentData, string>; // string -> errMessage
};

const INITIAL_STATE: FimsSSOState = {
  currentFlowState: "consents",
  consentsData: pot.none
};

const reducer = (
  state: FimsSSOState = INITIAL_STATE,
  action: Action
): FimsSSOState => {
  switch (action.type) {
    case getType(fimsGetConsentsListAction.request):
      return {
        currentFlowState: "consents",
        consentsData: pot.noneLoading
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        consentsData: pot.some(action.payload)
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.request):
      return {
        currentFlowState: "in-app-browser",
        consentsData: pot.noneLoading
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.success):
      return {
        ...state,
        consentsData: pot.none
      };
    case getType(fimsGetConsentsListAction.failure):
    case getType(fimsGetRedirectUrlAndOpenIABAction.failure):
      return {
        ...state,
        consentsData: pot.toError(state.consentsData, action.payload)
      };
    case getType(fimsCancelOrAbortAction):
      return pipe(
        state.consentsData,
        abortUrlFromConsentsPot,
        O.fold(
          () => ({ ...state }),
          () => ({ ...state, currentFlowState: "abort" })
        )
      );
  }
  return state;
};

export const fimsConsentsDataSelector = (state: GlobalState) =>
  state.features.fims.sso.consentsData;

export const fimsPartialAbortUrl = (state: GlobalState) =>
  pipe(state, fimsConsentsDataSelector, abortUrlFromConsentsPot, O.toUndefined);

const abortUrlFromConsentsPot = (consentsPot: pot.Pot<ConsentData, string>) =>
  pipe(
    consentsPot,
    pot.toOption,
    // eslint-disable-next-line no-underscore-dangle
    O.map(consents => consents._links.abort.href)
  );

export const fimsErrorStateSelector = (state: GlobalState) =>
  // this selector will be used to map the error message
  // once we have a clear error mapping
  pot.isError(state.features.fims.sso.consentsData)
    ? state.features.fims.sso.consentsData.error
    : undefined;

export const fimsLoadingStateSelector = (state: GlobalState) =>
  pipe(
    state.features.fims.sso.currentFlowState,
    foldFimsFlowStateK(
      consentsState =>
        pipe(state.features.fims.sso.consentsData, consentsPot =>
          pipe(
            pot.isLoading(consentsPot) || isStrictNone(consentsPot),
            B.fold(
              () => undefined,
              () => consentsState
            )
          )
        ),
      identity,
      identity
    )
  );

const foldFimsFlowState = <A>(
  flowState: FimsFlowStateTags,
  onConsents: (state: "consents") => A,
  onInAppBrowser: (state: "in-app-browser") => A,
  onAbort: (state: "abort") => A
) => {
  switch (flowState) {
    case "abort":
      return onAbort(flowState);
    case "in-app-browser":
      return onInAppBrowser(flowState);
  }
  return onConsents(flowState);
};

const foldFimsFlowStateK =
  <A>(
    onConsents: (state: "consents") => A,
    onInAppBrowser: (state: "in-app-browser") => A,
    onAbort: (state: "abort") => A
  ) =>
  (flowState: FimsFlowStateTags) =>
    foldFimsFlowState(flowState, onConsents, onInAppBrowser, onAbort);

export default reducer;
