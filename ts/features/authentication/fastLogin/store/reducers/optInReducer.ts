import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { setFastLoginOptIn } from "../actions/optInActions";
import { Action } from "../../../../../store/actions/types";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../authentication/common/store/actions";
import { isDevEnv } from "../../../../../utils/environment";
import { consolidateActiveSessionLoginData } from "../../../activeSessionLogin/store/actions";

export type FastLoginOptInState = {
  enabled: boolean | undefined;
};

export const fastLoginOptInInitialState: FastLoginOptInState = {
  enabled: undefined
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
        enabled: action.payload.enabled
      };
    case getType(consolidateActiveSessionLoginData):
      return {
        ...state,
        enabled: action.payload.fastLoginOptIn
      };
    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "optIn",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  whitelist: ["enabled"]
};

export const fastLoginOptInPersistor = persistReducer<
  FastLoginOptInState,
  Action
>(persistConfig, fastLoginOptInReducer);

export const testableFastLoginOptInReducer = isDevEnv
  ? {
      fastLoginOptInReducer
    }
  : undefined;
