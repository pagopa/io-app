import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../actions";
import { ConsentData } from "../../types";
export type FimsState = {
  ctaUrl?: string;
  consentsData: pot.Pot<ConsentData, Error>;
  errorState: O.Option<Error>;
};

const INITIAL_STATE: FimsState = {
  ctaUrl: undefined,
  consentsData: pot.none,
  errorState: O.none
};

const reducer = (
  state: FimsState = INITIAL_STATE,
  action: Action
): FimsState => {
  switch (action.type) {
    case getType(fimsGetConsentsListAction.request):
      return {
        errorState: O.none,
        ctaUrl: action.payload.ctaUrl,
        consentsData: pot.noneLoading
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        consentsData: pot.some(action.payload)
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.request):
      return {
        ...state,
        errorState: O.none,
        consentsData: pot.none
      };
    case getType(fimsGetRedirectUrlAndOpenIABAction.success):
      return {
        ...state,
        consentsData: pot.none,
        ctaUrl: undefined
      };
    case getType(fimsGetConsentsListAction.failure):
    case getType(fimsGetRedirectUrlAndOpenIABAction.failure):
      return {
        ctaUrl: undefined,
        consentsData: pot.none,
        errorState: O.some(action.payload)
      };
  }
  return state;
};

export const fimsConsentsDataSelector = (state: GlobalState) =>
  state.features.fims.consentsData;

export const fimsCTAUrlSelector = (state: GlobalState) =>
  state.features.fims.ctaUrl;

export const fimsErrorStateSelector = (state: GlobalState) =>
  state.features.fims.errorState;

export default reducer;
