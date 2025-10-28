import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { Action } from "../../../../../store/actions/types";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setActiveSessionLoginLocalFlag,
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
  activeSessionLoginLocalFlag: boolean;
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
  activeSessionLoginLocalFlag: false,
  isActiveSessionLogin: false,
  isUserLoggedIn: false
};

const activeSessionLoginReducer = (
  state: ActiveSessionLoginState = initialState,
  action: Action
): ActiveSessionLoginState => {
  switch (action.type) {
    case getType(setActiveSessionLoginLocalFlag):
      return {
        ...state,
        activeSessionLoginLocalFlag: action.payload
      };
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

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "activeSessionLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  whitelist: ["activeSessionLoginLocalFlag"]
};

export const activeSessionLoginPersistor = persistReducer<
  ActiveSessionLoginState,
  Action
>(persistConfig, activeSessionLoginReducer);

export const testable = isTestEnv ? initialState : undefined;

export const testableReducer = isTestEnv
  ? activeSessionLoginReducer
  : undefined;
