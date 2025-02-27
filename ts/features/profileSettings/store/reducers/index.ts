import { getType } from "typesafe-actions";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  persistReducer
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { Action } from "../../../../store/actions/types";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { isDevEnv } from "../../../../utils/environment";

// eslint-disable-next-line @typescript-eslint/ban-types
export type ProfileSettingsState = {};

export const profileSettingsReducerInitialState = {};

const profileSettingsReducer = (
  state: ProfileSettingsState = profileSettingsReducerInitialState,
  action: Action
): ProfileSettingsState => {
  switch (action.type) {
    case getType(differentProfileLoggedIn): {
      return profileSettingsReducerInitialState;
    }
    default:
      return state;
  }
};
const CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION = 2;

const migrations: MigrationManifest = {
  // we changed the way we compute the installation ID
  "0": state => ({
    ...state,
    hasUserAcknowledgedSettingsBanner: false
  }),
  "1": state => _.omit(state, "showProfileBanner"),
  "2": state => _.omit(state, "hasUserAcknowledgedSettingsBanner")
};
const persistConfig: PersistConfig = {
  key: "profileSettings",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  version: CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION,
  whitelist: []
};

export const profileSettingsReducerPersistor = persistReducer(
  persistConfig,
  profileSettingsReducer
);
