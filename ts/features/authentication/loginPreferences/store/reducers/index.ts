import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../../store/actions/types";
import {
  closeSessionExpirationBanner,
  setActiveSessionLoginLocalFlag
} from "../actions";
import { loginSuccess } from "../../../common/store/actions";

export type LoginPreferencesState = {
  showSessionExpirationBanner: boolean;
  activeSessionLoginLocalFlag: boolean;
};

const loginPreferencesInitialState: LoginPreferencesState = {
  showSessionExpirationBanner: true,
  activeSessionLoginLocalFlag: false
};

const loginPreferencesReducer = (
  state: LoginPreferencesState = loginPreferencesInitialState,
  action: Action
): LoginPreferencesState => {
  switch (action.type) {
    case getType(loginSuccess):
      return {
        ...loginPreferencesInitialState,
        activeSessionLoginLocalFlag: state.activeSessionLoginLocalFlag
      };
    case getType(closeSessionExpirationBanner):
      return {
        ...state,
        showSessionExpirationBanner: false
      };
    case getType(setActiveSessionLoginLocalFlag):
      return {
        ...state,
        activeSessionLoginLocalFlag: action.payload
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "loginPreferences",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  whitelist: ["showSessionExpirationBanner"]
};

export const loginPreferencesPersistor = persistReducer<
  LoginPreferencesState,
  Action
>(persistConfig, loginPreferencesReducer);
