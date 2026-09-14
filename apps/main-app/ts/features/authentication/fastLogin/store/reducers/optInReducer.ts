import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { isDevEnv } from "../../../../../utils/environment";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../authentication/common/store/actions";
import { consolidateActiveSessionLoginData } from "../../../activeSessionLogin/store/actions";
import { setFastLoginOptIn } from "../actions/optInActions";

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
    case getType(consolidateActiveSessionLoginData):
      return {
        ...state,
        enabled: action.payload.fastLoginOptIn
      };
    case getType(logoutFailure):
    case getType(logoutSuccess):
      return fastLoginOptInInitialState;
    case getType(setFastLoginOptIn):
      return {
        ...state,
        enabled: action.payload.enabled
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
