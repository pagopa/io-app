import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { setFastLoginSessionRefresh } from "../actions/sessionRefreshActions";
import { Action } from "../../../../store/actions/types";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../store/actions/authentication";

export type FastLoginSessionRefreshState = {
  enabled: boolean | undefined;
};

export const fastLoginSessionRefreshInitialState: FastLoginSessionRefreshState =
  {
    enabled: undefined
  };

const fastLoginSessionRefreshReducer = (
  state: FastLoginSessionRefreshState = fastLoginSessionRefreshInitialState,
  action: Action
): FastLoginSessionRefreshState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return fastLoginSessionRefreshInitialState;
    case getType(setFastLoginSessionRefresh):
      return {
        ...state,
        enabled: action.payload.enabled
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

export const fastLoginSessionRefreshPersistor = persistReducer<
  FastLoginSessionRefreshState,
  Action
>(persistConfig, fastLoginSessionRefreshReducer);
