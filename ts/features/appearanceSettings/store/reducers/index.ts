import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { Action } from "../../../../store/actions/types";
import { isDevEnv } from "../../../../utils/environment";
import { setShowAppearanceSettingsBanner } from "../actions";

export type AppearanceSettingsState = {
  showAppearanceBanner: boolean;
};

export const appearanceSettingsReducerInitialState = {
  showAppearanceBanner: true
};

const appearanceSettingsReducer = (
  state: AppearanceSettingsState = appearanceSettingsReducerInitialState,
  action: Action
): AppearanceSettingsState => {
  switch (action.type) {
    case getType(setShowAppearanceSettingsBanner): {
      return {
        ...state,
        showAppearanceBanner: action.payload
      };
    }
    case getType(differentProfileLoggedIn): {
      return appearanceSettingsReducerInitialState;
    }
    default:
      return state;
  }
};

const CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  // we changed the way we compute the installation ID
  "0": (state): AppearanceSettingsState & PersistPartial => {
    const prevState = state as AppearanceSettingsState & PersistPartial;

    return {
      ...prevState,
      showAppearanceBanner: true
    };
  }
};

const persistConfig: PersistConfig = {
  key: "appearanceSettings",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  version: CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION,
  whitelist: ["showAppearanceBanner"]
};

export const appearanceSettingsReducerPersistor = persistReducer(
  persistConfig,
  appearanceSettingsReducer
);
