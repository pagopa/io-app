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
import { GlobalState } from "../../../../../store/reducers/types";

export type SENDLoginEngagementState = {
  hasSendEngagementScreenBeenDismissed: boolean;
};

export const SEND_LOGIN_ENGAGEMENT_INITIAL_STATE: SENDLoginEngagementState = {
  hasSendEngagementScreenBeenDismissed: false
};

const sendLoginEngagementReducer = (
  state = SEND_LOGIN_ENGAGEMENT_INITIAL_STATE,
  action: Action
): SENDLoginEngagementState => {
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
  key: "sendLoginEngagementReducer",
  storage: AsyncStorage,
  version: CURRENT_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

export const hasSendEngagementScreenBeenDismissedSelector = (
  state: GlobalState
) => state.features.pn.loginEngagement.hasSendEngagementScreenBeenDismissed;

export const persistedSendLoginEngagementReducer = persistReducer(
  persistConfig,
  sendLoginEngagementReducer
);

export const testable = isTestEnv
  ? {
      sendLoginEngagementReducer
    }
  : undefined;
