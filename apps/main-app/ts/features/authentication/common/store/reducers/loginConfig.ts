import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../actions/loginConfig";

export type LoginConfigState = {
  /** The target environment for the OneIdentity login flow. */
  oneIdentityEnv: OneIdentityEnv;
  /**
   * The local feature flag for the OneIdentity login flow. - `true` / `false`:
   * Forces the feature on or off locally. - `undefined`: Indicates no local
   * setting, deferring to the remote rollout.
   */
  oneIdentityLocalFeatureFlag: boolean | undefined;
};

export type OneIdentityEnv = "prod" | "uat";

export const loginConfigInitialState: LoginConfigState = {
  oneIdentityLocalFeatureFlag: undefined,
  oneIdentityEnv: "prod"
};

export const loginConfigReducer = (
  state: LoginConfigState = loginConfigInitialState,
  action: Action
): LoginConfigState => {
  switch (action.type) {
    case getType(setOneIdentityEnv):
      return {
        ...state,
        oneIdentityEnv: action.payload
      };
    case getType(setOneIdentityLocalFeatureFlag):
      return {
        ...state,
        oneIdentityLocalFeatureFlag: action.payload
      };
    default:
      return state;
  }
};

export const CURRENT_REDUX_LOGIN_CONFIG_STORE_VERSION = 0;

export const persistConfig: PersistConfig = {
  key: "loginConfig",
  storage: AsyncStorage,
  version: CURRENT_REDUX_LOGIN_CONFIG_STORE_VERSION,
  whitelist: ["oneIdentityLocalFeatureFlag", "oneIdentityEnv"]
};

export const loginConfigPersistor = persistReducer<LoginConfigState, Action>(
  persistConfig,
  loginConfigReducer
);
