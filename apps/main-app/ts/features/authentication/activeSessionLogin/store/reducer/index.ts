import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { isTestEnv } from "../../../../../utils/environment";
import { SpidIdp } from "../../../../../utils/idps";
import {
  logoutFailure,
  logoutSuccess,
  sessionCorrupted
} from "../../../common/store/actions";
import { SpidLevel } from "../../../login/cie/utils";
import { SpidLoginRequestInfo } from "../../../login/idp/store/types";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  closeSessionExpirationBanner,
  consolidateActiveSessionLoginData,
  setActiveSessionLoginBlockingScreenHasBeenVisualized,
  setActiveSessionLoginFlow,
  setActiveSessionLoginLocalFlag,
  setCieIDSelectedSecurityLevelActiveSessionLogin,
  setFastLoginOptSessionLogin,
  setFinishedActiveSessionLoginFlow,
  setIdpSelectedActiveSessionLogin,
  setLoggedOutUserWithDifferentCF,
  setStartActiveSessionLogin
} from "../actions";

export type ActiveSessionLoginState = {
  activeSessionLoginLocalFlag: boolean;
  engagement: {
    hasBlockingScreenBeenVisualized: boolean;
    showSessionExpirationBanner: boolean;
  };
  flow?: "FCI"; // We can extend this type with other flows in the future if needed
  isActiveSessionLogin: boolean;
  isUserLoggedIn: boolean;
  loginInfo?: {
    cieIDSelectedSecurityLevel?: SpidLevel;
    fastLoginOptIn?: boolean;
    idp?: SpidIdp;
    spidLoginInfo?: SpidLoginRequestInfo;
    token?: string;
  };
};

export const activeSessionLoginInitialState: ActiveSessionLoginState = {
  activeSessionLoginLocalFlag: false,
  isActiveSessionLogin: false,
  isUserLoggedIn: false,
  engagement: {
    hasBlockingScreenBeenVisualized: false,
    showSessionExpirationBanner: true
  }
};

const activeSessionLoginReducer = (
  state: ActiveSessionLoginState = activeSessionLoginInitialState,
  action: Action
): ActiveSessionLoginState => {
  switch (action.type) {
    case getType(activeSessionLoginFailure):
      return {
        ...state,
        isUserLoggedIn: false
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
    case getType(closeSessionExpirationBanner):
      return {
        ...state,
        activeSessionLoginLocalFlag: false,
        engagement: {
          hasBlockingScreenBeenVisualized: false,
          showSessionExpirationBanner: false
        }
      };
    case getType(consolidateActiveSessionLoginData):
      // Preserve the flow when consolidating data, it will be used after startup
      return {
        ...activeSessionLoginInitialState,
        flow: state.flow
      };
    case getType(logoutFailure):
    case getType(logoutSuccess):
    case getType(sessionCorrupted):
    case getType(setLoggedOutUserWithDifferentCF):
      return activeSessionLoginInitialState;
    case getType(setActiveSessionLoginBlockingScreenHasBeenVisualized):
      return {
        ...state,
        engagement: {
          ...state.engagement,
          hasBlockingScreenBeenVisualized: true
        }
      };
    case getType(setActiveSessionLoginFlow):
      return {
        ...state,
        flow: action.payload
      };

    case getType(setActiveSessionLoginLocalFlag):
      return {
        ...state,
        activeSessionLoginLocalFlag: action.payload,
        engagement: { ...activeSessionLoginInitialState.engagement }
      };
    case getType(setCieIDSelectedSecurityLevelActiveSessionLogin):
      return {
        ...state,
        loginInfo: {
          ...state.loginInfo,
          cieIDSelectedSecurityLevel: action.payload
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
    case getType(setFinishedActiveSessionLoginFlow):
      return {
        isActiveSessionLogin: false,
        isUserLoggedIn: false,
        activeSessionLoginLocalFlag: state.activeSessionLoginLocalFlag,
        engagement: { ...state.engagement }
      };
    case getType(setIdpSelectedActiveSessionLogin):
      return {
        ...state,
        loginInfo: {
          ...state.loginInfo,
          idp: action.payload
        }
      };
    case getType(setStartActiveSessionLogin):
      return {
        ...state,
        isActiveSessionLogin: true
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_ACTIVE_SESSION_STATE_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "activeSessionLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ACTIVE_SESSION_STATE_STORE_VERSION,
  whitelist: ["activeSessionLoginLocalFlag", "engagement"]
};

export const activeSessionLoginPersistor = persistReducer<
  ActiveSessionLoginState,
  Action
>(persistConfig, activeSessionLoginReducer);

export const testable = isTestEnv ? activeSessionLoginInitialState : undefined;

export const testableReducer = isTestEnv
  ? activeSessionLoginReducer
  : undefined;
