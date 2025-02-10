import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, PersistConfig } from "redux-persist";
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

const persistConfig: PersistConfig = {
  key: "appearanceSettings",
  storage: AsyncStorage
};

export const appearanceSettingsReducerPersistor = persistReducer(
  persistConfig,
  appearanceSettingsReducer
);
