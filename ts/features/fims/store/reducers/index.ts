import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { HttpClientSuccessResponse } from "../../__mocks__/mockFIMSCallbacks";
import {
  fimsGetConsentsListAction,
  fimsGetRedirectUrlAndOpenIABAction
} from "../actions";
export type FimsState = {
  ctaUrl?: string;
  consentsData: pot.Pot<HttpClientSuccessResponse, Error>;
};

const INITIAL_STATE: FimsState = {
  ctaUrl: undefined,
  consentsData: pot.none
};

const reducer = (
  state: FimsState = INITIAL_STATE,
  action: Action
): FimsState => {
  switch (action.type) {
    case getType(fimsGetConsentsListAction.request):
      return {
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
        consentsData: pot.none
      };
  }
  return state;
};

export default reducer;
