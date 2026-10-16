import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import {
  consolidateActiveSessionLoginData,
  setLoggedOutUserWithDifferentCF
} from "../../../activeSessionLogin/store/actions";
import {
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionCorrupted,
  sessionExpired,
  sessionInvalid
} from "../actions";

export type LoginFlowState = {
  /**
   * Login flow of the current session:
   *
   * - `undefined`: the user is not logged in
   * - `false`: logged in with IO
   * - `true`: logged in with OneIdentity
   */
  isOneIdentityLogin: boolean | undefined;
};

export const loginFlowInitialState: LoginFlowState = {
  isOneIdentityLogin: undefined
};

export const loginFlowReducer = (
  state: LoginFlowState = loginFlowInitialState,
  action: Action
): LoginFlowState => {
  switch (action.type) {
    case getType(consolidateActiveSessionLoginData):
    case getType(loginSuccess):
      return { isOneIdentityLogin: action.payload.isOneIdentityLogin };
    case getType(loginFailure):
    case getType(logoutFailure):
    case getType(logoutSuccess):
    case getType(sessionCorrupted):
    case getType(sessionExpired):
    case getType(sessionInvalid):
    case getType(setLoggedOutUserWithDifferentCF):
      return loginFlowInitialState;
    default:
      return state;
  }
};

export const CURRENT_REDUX_LOGIN_FLOW_STORE_VERSION = 0;

export const loginFlowPersistConfig: PersistConfig = {
  key: "loginFlow",
  storage: AsyncStorage,
  version: CURRENT_REDUX_LOGIN_FLOW_STORE_VERSION
};

export const loginFlowPersistor = persistReducer<LoginFlowState, Action>(
  loginFlowPersistConfig,
  loginFlowReducer
);
