import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import {
  resetDebugData,
  setDebugData,
  setDebugModeEnabled,
  setI18nDebugEnabled
} from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

type DebugState = Readonly<{
  debugData: Record<string, unknown>;
  isDebugModeEnabled: boolean;
  isI18nDebugEnabled: boolean;
}>;

const INITIAL_STATE: DebugState = {
  isDebugModeEnabled: false,
  isI18nDebugEnabled: false,
  debugData: {}
};

function debugReducer(
  state: DebugState = INITIAL_STATE,
  action: Action
): DebugState {
  switch (action.type) {
    case getType(resetDebugData):
      return {
        ...state,
        debugData: Object.fromEntries(
          Object.entries(state.debugData).filter(
            ([key]) => !action.payload.includes(key)
          )
        )
      };

    /**
     * Debug data to be displayed in DebugInfoOverlay
     */
    case getType(setDebugData):
      return {
        ...state,
        debugData: {
          ...state.debugData,
          ...action.payload
        }
      };
    case getType(setDebugModeEnabled):
      return {
        ...state,
        isDebugModeEnabled: action.payload,
        debugData: {}
      };
    case getType(setI18nDebugEnabled):
      return {
        ...state,
        isI18nDebugEnabled: action.payload
      };
  }

  return state;
}

// Persistor
const CURRENT_REDUX_DEBUG_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "debug",
  storage: AsyncStorage,
  version: CURRENT_REDUX_DEBUG_STORE_VERSION,
  whitelist: ["isDebugModeEnabled", "isI18nDebugEnabled"]
};

export type PersistedDebugState = DebugState & PersistPartial;

export const debugPersistor = persistReducer<DebugState, Action>(
  persistConfig,
  debugReducer
);

// Selector
export const isDebugModeEnabledSelector = (state: GlobalState) =>
  state.debug.isDebugModeEnabled;

/**
 * Selector for the translation key debug overlay preference.
 * When true, all `I18n.t()` calls return the key in brackets instead of the
 * translated string.
 */
export const isI18nDebugEnabledSelector = (state: GlobalState) =>
  state.debug.isI18nDebugEnabled;

/**
 * Selector that returns the debug data without the undefined values
 * avoiding to display empty values in the DebugInfoOverlay
 */
export const debugDataSelector = createSelector(
  (state: GlobalState) => state.debug.debugData,
  debugData =>
    Object.fromEntries(
      Object.entries(debugData).filter(([_, value]) => value !== undefined)
    )
);
