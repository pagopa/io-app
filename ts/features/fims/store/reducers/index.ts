import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenBrowserAction
} from "../actions";
import { Action } from "../../../../store/actions/types";
export type FimsState = {
  ctaUrl?: string;
  consents: pot.Pot<any, Error>;
};

const INITIAL_STATE: FimsState = {
  ctaUrl: undefined,
  consents: pot.none
};

const reducer = (
  state: FimsState = INITIAL_STATE,
  action: Action
): FimsState => {
  switch (action.type) {
    case getType(fimsGetConsentsListAction.request):
      return {
        ctaUrl: action.payload.ctaUrl,
        consents: pot.noneLoading
      };
    case getType(fimsGetConsentsListAction.success):
      return {
        ...state,
        consents: pot.some(action.payload)
      };
    case getType(fimsGetConsentsListAction.failure):
      return state;
    case getType(fimsGetRedirectUrlAndOpenBrowserAction.request):
      return {
        ...state,
        consents: pot.none
      };
    case getType(fimsGetRedirectUrlAndOpenBrowserAction.success):
    case getType(fimsGetRedirectUrlAndOpenBrowserAction.failure):
      return state;
  }
  return state;
};

export default reducer;
