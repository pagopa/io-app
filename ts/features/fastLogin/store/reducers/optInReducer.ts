import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { setFastLoginOptIn } from "../actions/optInActions";
import { Action } from "../../../../store/actions/types";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../store/actions/authentication";

export type FastLoginOptInState = {
  fastLoginEnabled: boolean | undefined;
};

export const fastLoginOptInInitialState: FastLoginOptInState = {
  fastLoginEnabled: undefined
};

const fastLoginOptInReducer = (
  state: FastLoginOptInState = fastLoginOptInInitialState,
  action: Action
): FastLoginOptInState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return fastLoginOptInInitialState;
    case getType(setFastLoginOptIn):
      return {
        ...state,
        fastLoginEnabled: action.payload.fastLoginEnabled
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_FEATURES_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "optIn",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FEATURES_STORE_VERSION,
  whitelist: ["fastLoginEnabled"]
};

export const fastLoginOptInPersistor = persistReducer<
  FastLoginOptInState,
  Action
>(persistConfig, fastLoginOptInReducer);
