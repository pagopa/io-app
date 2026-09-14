import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { Action } from "../../../../store/actions/types";
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
    case getType(differentProfileLoggedIn): {
      return appearanceSettingsReducerInitialState;
    }
    case getType(setShowAppearanceSettingsBanner): {
      return {
        ...state,
        showAppearanceBanner: action.payload
      };
    }
    default:
      return state;
  }
};

const persistConfig: PersistConfig = {
  key: "appearanceSettings",
  storage: AsyncStorage
};

export const appearanceSettingsReducerPersistor = persistReducer(
  persistConfig,
  appearanceSettingsReducer
);
