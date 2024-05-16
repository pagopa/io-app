import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setShowProfileBanner } from "../actions";
import { Action } from "../../../../store/actions/types";

export type ProfileSettingsState = {
  showProfileBanner: boolean;
};

export const profileSettingsReducerInitialState = {
  showProfileBanner: true
};

const profileSettingsReducer = (
  state: ProfileSettingsState = profileSettingsReducerInitialState,
  action: Action
): ProfileSettingsState => {
  switch (action.type) {
    case getType(setShowProfileBanner): {
      return {
        ...state,
        showProfileBanner: action.payload
      };
    }
    default:
      return state;
  }
};

const CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "profileSettings",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PROFILE_SETTINGS_STORE_VERSION,
  whitelist: ["showProfileBanner"]
};

export const profileSettingsReducerPersistor = persistReducer(
  persistConfig,
  profileSettingsReducer
);
