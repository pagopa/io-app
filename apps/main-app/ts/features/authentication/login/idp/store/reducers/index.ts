import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import {
  incrementNativeLoginNativeAttempts,
  resetSpidLoginState,
  setNativeLoginRequestInfo,
  setStandardLoginInLoadingState,
  setStandardLoginRequestState
} from "../actions";
import { NativeLoginRequestInfo, StandardLoginRequestInfo } from "../types";

export type SpidLoginState = {
  nativeLogin: {
    requestInfo: NativeLoginRequestInfo;
  };
  standardLogin: {
    requestInfo: StandardLoginRequestInfo;
  };
};

const spidLoginInitialState: SpidLoginState = {
  nativeLogin: {
    requestInfo: {
      requestState: "LOADING",
      nativeAttempts: 0
    }
  },
  standardLogin: {
    requestInfo: {
      requestState: pot.noneLoading
    }
  }
};

export const spidLoginReducer = (
  state: SpidLoginState = spidLoginInitialState,
  action: Action
): SpidLoginState => {
  switch (action.type) {
    case getType(incrementNativeLoginNativeAttempts):
      return {
        ...state,
        nativeLogin: {
          ...state.nativeLogin,
          requestInfo: {
            requestState: "LOADING",
            nativeAttempts: state.nativeLogin.requestInfo.nativeAttempts + 1
          }
        }
      };
    case getType(resetSpidLoginState):
      return spidLoginInitialState;
    case getType(setNativeLoginRequestInfo):
      return {
        ...state,
        nativeLogin: {
          ...state.nativeLogin,
          requestInfo: action.payload
        }
      };
    case getType(setStandardLoginInLoadingState):
      return {
        ...state,
        standardLogin: {
          ...state.standardLogin,
          requestInfo: {
            ...state.standardLogin.requestInfo,
            requestState: pot.noneLoading
          }
        }
      };
    case getType(setStandardLoginRequestState):
      return {
        ...state,
        standardLogin: {
          ...state.standardLogin,
          requestInfo: {
            ...state.standardLogin.requestInfo,
            requestState: action.payload
          }
        }
      };
    default:
      return state;
  }
};
