import { getType } from "typesafe-actions";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistPartial,
  persistReducer
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { setHasUserAcknowledgedSettingsBanner } from "../actions";
import { Action } from "../../../../store/actions/types";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { isDevEnv } from "../../../../utils/environment";

export type ProfileSettingsState = {
  hasUserAcknowledgedSettingsBanner: boolean;
};

export const profileSettingsReducerInitialState = {
  hasUserAcknowledgedSettingsBanner: false
};

const profileSettingsReducer = (
  state: ProfileSettingsState = profileSettingsReducerInitialState,
  action: Action
): ProfileSettingsState => {
  switch (action.type) {
    case getType(differentProfileLoggedIn): {
      return profileSettingsReducerInitialState;
    }
    case getType(setHasUserAcknowledgedSettingsBanner): {
      return {
        ...state,
        hasUserAcknowledgedSettingsBanner: action.payload
      };
    }
    default:
      return state;
  }
};
const CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION = 1;

const migrations: MigrationManifest = {
  // we changed the way we compute the installation ID
  "0": (state): ProfileSettingsState & PersistPartial => {
    const prevState = state as ProfileSettingsState & PersistPartial;
    return {
      ...prevState,
      hasUserAcknowledgedSettingsBanner: false
    };
  },
  "1": (state): ProfileSettingsState & PersistPartial => {
    const prevState = state as ProfileSettingsState & PersistPartial;
    return _.omit(prevState, "showProfileBanner");
  }
};
const persistConfig: PersistConfig = {
  key: "profileSettings",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  version: CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION,
  whitelist: ["hasUserAcknowledgedSettingsBanner"]
};

export const profileSettingsReducerPersistor = persistReducer(
  persistConfig,
  profileSettingsReducer
);
