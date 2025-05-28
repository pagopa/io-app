import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  resetDebugData,
  setDebugData,
  setDebugModeEnabled
} from "../actions/debug";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
  debugData: Record<string, unknown>;
}>;

const INITIAL_STATE: DebugState = {
  isDebugModeEnabled: false,
  debugData: {}
};

function debugReducer(
  state: DebugState = INITIAL_STATE,
  action: Action
): DebugState {
  switch (action.type) {
    case getType(setDebugModeEnabled):
      return {
        ...state,
        isDebugModeEnabled: action.payload,
        debugData: {}
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
    case getType(resetDebugData):
      return {
        ...state,
        debugData: Object.fromEntries(
          Object.entries(state.debugData).filter(
            ([key]) => !action.payload.includes(key)
          )
        )
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
  whitelist: ["isDebugModeEnabled"]
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
