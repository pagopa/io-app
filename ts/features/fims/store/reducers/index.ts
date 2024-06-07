import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../actions";
import { ConsentData } from "../../types";
import { foldK, isStrictNone } from "../../../../utils/pot";

type FimsFlowStateTags = "consents" | "in-app-browser" | "abort";

export type FimsState = {
  currentFlowState: FimsFlowStateTags;
  consentsData: pot.Pot<ConsentData, string>; // string -> errMessage
};

const INITIAL_STATE: FimsState = {
  currentFlowState: "consents",
  consentsData: pot.none
};

const reducer = (
  state: FimsState = INITIAL_STATE,
  action: Action
): FimsState => {
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
  state.features.fims.consentsData;

export const fimsPartialAbortUrl = (state: GlobalState) =>
  pipe(state, fimsConsentsDataSelector, abortUrlFromConsentsPot, O.toUndefined);

const abortUrlFromConsentsPot = (consentsPot: pot.Pot<ConsentData, string>) =>
  pipe(
    consentsPot,
    foldK(
      () => O.none,
      () => O.none,
      newConsents => O.some(newConsents),
      _ => O.none,
      consents => O.some(consents),
      consents => O.some(consents),
      (_, newConsents) => O.some(newConsents),
      (consents, _) => O.some(consents)
    ),
    // eslint-disable-next-line no-underscore-dangle
    O.map(consents => consents._links.abort.href)
  );

export const fimsErrorStateSelector = (state: GlobalState) =>
  // this selector will be used to map the error message
  // once we have a clear error mapping
  pot.isError(state.features.fims.consentsData)
    ? state.features.fims.consentsData.error
    : undefined;

export const fimsLoadingStateSelector = (state: GlobalState) => {
  if (state.features.fims.currentFlowState === "in-app-browser") {
    return "in-app-browser";
  }
  const { consentsData } = state.features.fims;
  return pot.isLoading(consentsData) || isStrictNone(consentsData)
    ? state.features.fims.currentFlowState
    : undefined;
};

export default reducer;
