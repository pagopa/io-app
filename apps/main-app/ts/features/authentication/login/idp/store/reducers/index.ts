import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import {
  resetSpidLoginState,
  setSpidLoginInLoadingState,
  setSpidLoginRequestState
} from "../actions";
import { SpidLoginRequestInfo } from "../types";

export type SpidLoginState = {
  requestInfo: SpidLoginRequestInfo;
};

const spidLoginInitialState: SpidLoginState = {
  requestInfo: {
    requestState: pot.noneLoading
  }
};

export const spidLoginReducer = (
  state: SpidLoginState = spidLoginInitialState,
  action: Action
): SpidLoginState => {
  switch (action.type) {
    case getType(resetSpidLoginState):
      return spidLoginInitialState;
    case getType(setSpidLoginInLoadingState):
      return {
        ...state,
        requestInfo: {
          ...state.requestInfo,
          requestState: pot.noneLoading
        }
      };
    case getType(setSpidLoginRequestState):
      return {
        ...state,
        requestInfo: {
          ...state.requestInfo,
          requestState: action.payload
        }
      };
    default:
      return state;
  }
};
