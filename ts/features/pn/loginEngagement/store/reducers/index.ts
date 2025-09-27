import { getType } from "typesafe-actions";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  persistReducer
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../../store/actions/types";
import { setSendEngagementScreenHasBeenDismissed } from "../actions";
import { isDevEnv, isTestEnv } from "../../../../../utils/environment";
import { PNLoginEngagementState } from "../types";

export const PN_LOGIN_ENGAGEMENT_INITIAL_STATE: PNLoginEngagementState = {
  hasSendEngagementScreenBeenDismissed: false
};

const pnLoginEngagementReducer = (
  state = PN_LOGIN_ENGAGEMENT_INITIAL_STATE,
  action: Action
): PNLoginEngagementState => {
  switch (action.type) {
    case getType(setSendEngagementScreenHasBeenDismissed):
      return {
        ...state,
        hasSendEngagementScreenBeenDismissed: true
      };
    default:
      return state;
  }
};

const CURRENT_STORE_VERSION = -1;
const migrations: MigrationManifest = {};

const persistConfig: PersistConfig = {
  key: "pnLoginEngagementReducer",
  storage: AsyncStorage,
  version: CURRENT_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: ["hasSendEngagementScreenBeenDismissed"]
};

export const persistedPnLoginEngagementReducer = persistReducer(
  persistConfig,
  pnLoginEngagementReducer
);

export const testable = isTestEnv
  ? {
      pnLoginEngagementReducer
    }
  : undefined;
