import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../../../store/actions/types";
import { StandardLoginRequestInfo } from "../types";
import {
  setSpidLoginRequestState,
  setSpidLoginInLoadingState,
  resetSpidLoginState
} from "../actions";

export type SpidLoginState = {
  requestInfo: StandardLoginRequestInfo;
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
    case getType(setSpidLoginRequestState):
      return {
        ...state,
        requestInfo: {
          ...state.requestInfo,
          requestState: action.payload
        }
      };
    case getType(setSpidLoginInLoadingState):
      return {
        ...state,
        requestInfo: {
          ...state.requestInfo,
          requestState: pot.noneLoading
        }
      };
    case getType(resetSpidLoginState):
      return spidLoginInitialState;
    default:
      return state;
  }
};
