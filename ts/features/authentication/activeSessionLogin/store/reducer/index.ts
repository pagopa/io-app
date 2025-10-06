import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setFastLoginOptSessionLogin,
  setFinishedActiveSessionLoginFlow,
  setIdpSelectedActiveSessionLogin,
  setLoggedOutUserWithDifferentCF,
  setStartActiveSessionLogin
} from "../actions";
import { SpidIdp } from "../../../../../utils/idps";
import { SessionToken } from "../../../../../types/SessionToken";
import { StandardLoginRequestInfo } from "../../../login/idp/store/types";
import { isTestEnv } from "../../../../../utils/environment";
import { sessionCorrupted } from "../../../common/store/actions";

export type ActiveSessionLoginState = {
  isActiveSessionLogin: boolean;
  isUserLoggedIn: boolean;
  loginInfo?: {
    idp?: SpidIdp;
    token?: SessionToken;
    fastLoginOptIn?: boolean;
    spidLoginInfo?: StandardLoginRequestInfo;
  };
};

const initialState: ActiveSessionLoginState = {
  isActiveSessionLogin: false,
  isUserLoggedIn: false
};

export const activeSessionLoginReducer = (
  state: ActiveSessionLoginState = initialState,
  action: Action
): ActiveSessionLoginState => {
  switch (action.type) {
    case getType(setStartActiveSessionLogin):
      return {
        ...state,
        isActiveSessionLogin: true
      };
    case getType(setIdpSelectedActiveSessionLogin):
      return {
        ...state,
        loginInfo: {
          ...state.loginInfo,
          idp: action.payload
        }
      };
    case getType(setFastLoginOptSessionLogin):
      return {
        ...state,
        loginInfo: {
          ...state.loginInfo,
          fastLoginOptIn: action.payload
        }
      };
    case getType(activeSessionLoginSuccess):
      return {
        ...state,
        isUserLoggedIn: true,
        loginInfo: {
          ...state.loginInfo,
          token: action.payload
        }
      };
    case getType(activeSessionLoginFailure):
      return {
        ...state,
        isUserLoggedIn: false
      };

    case getType(setFinishedActiveSessionLoginFlow):
    case getType(consolidateActiveSessionLoginData):
    case getType(setLoggedOutUserWithDifferentCF):
    case getType(sessionCorrupted):
      return initialState;

    default:
      return state;
  }
};

export const testable = isTestEnv ? initialState : undefined;
