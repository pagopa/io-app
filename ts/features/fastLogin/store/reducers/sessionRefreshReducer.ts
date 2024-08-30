import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import {
  areTwoMinElapsedFromLastActivity,
  setAutomaticSessionRefresh
} from "../actions/sessionRefreshActions";
import { Action } from "../../../../store/actions/types";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../store/actions/authentication";

export type AutomaticSessionRefreshState = {
  enabled: boolean | undefined;
  areAlreadyTwoMinAfterLastActivity: boolean;
};

export const automaticSessionRefreshInitialState: AutomaticSessionRefreshState =
  {
    enabled: undefined,
    areAlreadyTwoMinAfterLastActivity: false
  };

const AutomaticSessionRefreshReducer = (
  state: AutomaticSessionRefreshState = automaticSessionRefreshInitialState,
  action: Action
): AutomaticSessionRefreshState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return automaticSessionRefreshInitialState;
    case getType(setAutomaticSessionRefresh):
      return {
        ...state,
        enabled: action.payload.enabled
      };
    case getType(areTwoMinElapsedFromLastActivity):
      return {
        ...state,
        areAlreadyTwoMinAfterLastActivity: action.payload.hasTwoMinPassed
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_SESSION_REFRESH_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "sessionRefresh",
  storage: AsyncStorage,
  version: CURRENT_REDUX_SESSION_REFRESH_STORE_VERSION,
  whitelist: ["enabled"]
};

export const automaticSessionRefreshPersistor = persistReducer<
  AutomaticSessionRefreshState,
  Action
>(persistConfig, AutomaticSessionRefreshReducer);
