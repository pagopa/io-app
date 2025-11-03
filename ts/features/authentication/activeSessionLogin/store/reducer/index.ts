import { getType } from "typesafe-actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { Action } from "../../../../../store/actions/types";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  closeSessionExpirationBanner,
  consolidateActiveSessionLoginData,
  setActiveSessionLoginLocalFlag,
  setFastLoginOptSessionLogin,
  setFinishedActiveSessionLoginFlow,
  setIdpSelectedActiveSessionLogin,
  setLoggedOutUserWithDifferentCF,
  setStartActiveSessionLogin,
  setVisualizeActiveSessionLoginBlockingScreen
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
  engagement: {
    hasBlockingScreenBeenVisualized: boolean;
    showSessionExpirationBanner: boolean;
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
    case getType(setActiveSessionLoginLocalFlag):
      return {
        ...state,
        activeSessionLoginLocalFlag: action.payload,
        engagement: { ...activeSessionLoginInitialState.engagement }
      };
    case getType(setVisualizeActiveSessionLoginBlockingScreen):
      return {
        ...state,
        engagement: {
          ...state.engagement,
          hasBlockingScreenBeenVisualized: true
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
      return {
        isActiveSessionLogin: false,
        isUserLoggedIn: false,
        activeSessionLoginLocalFlag: state.activeSessionLoginLocalFlag,
        engagement: { ...state.engagement }
      };
    case getType(consolidateActiveSessionLoginData):
    case getType(setLoggedOutUserWithDifferentCF):
    case getType(sessionCorrupted):
      return activeSessionLoginInitialState;
    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "activeSessionLogin",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
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
