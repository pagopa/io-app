import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types.ts";
import { TourItem } from "../../types/index.ts";
import {
  completeTourAction,
  nextTourStepAction,
  prevTourStepAction,
  registerTourItemAction,
  resetTourCompletedAction,
  startTourAction,
  stopTourAction,
  unregisterTourItemAction
} from "../actions/index.ts";

export type TourState = {
  items: { [groupId: string]: ReadonlyArray<TourItem> };
  activeGroupId?: string;
  activeStepIndex: number;
  completed: ReadonlyArray<string>;
};

export const tourInitialState: TourState = {
  items: {},
  activeGroupId: undefined,
  activeStepIndex: 0,
  completed: []
};

const reducer = (
  state: TourState = tourInitialState,
  action: Action
): TourState => {
  switch (action.type) {
    case getType(registerTourItemAction): {
      const itemsForGroup = state.items[action.payload.groupId] ?? [];

      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.groupId]: [...itemsForGroup, action.payload]
        }
      };
    }

    case getType(unregisterTourItemAction): {
      const itemsForGroup = state.items[action.payload.groupId] ?? [];
      const updatedItemsForGroup = itemsForGroup.filter(
        item => item.index !== action.payload.index
      );

      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.groupId]: updatedItemsForGroup
        }
      };
    }

    case getType(startTourAction): {
      if (state.completed.includes(action.payload.groupId)) {
        return state;
      }
      return {
        ...state,
        activeGroupId: action.payload.groupId,
        activeStepIndex: 0
      };
    }

    case getType(stopTourAction):
      return {
        ...state,
        activeGroupId: undefined,
        activeStepIndex: 0
      };

    case getType(nextTourStepAction):
      return {
        ...state,
        activeStepIndex: state.activeStepIndex + 1
      };

    case getType(prevTourStepAction):
      return {
        ...state,
        activeStepIndex: Math.max(0, state.activeStepIndex - 1)
      };

    case getType(completeTourAction): {
      const alreadyCompleted = state.completed.includes(action.payload.groupId);
      return {
        ...state,
        activeGroupId: undefined,
        activeStepIndex: 0,
        completed: alreadyCompleted
          ? state.completed
          : [...state.completed, action.payload.groupId]
      };
    }

    case getType(resetTourCompletedAction):
      return {
        ...state,
        completed: state.completed.filter(id => id !== action.payload.groupId)
      };

    default:
      return state;
  }
};

const CURRENT_REDUX_TOUR_STORE_VERSION = 0;

const persistConfig: PersistConfig = {
  key: "tour",
  storage: AsyncStorage,
  version: CURRENT_REDUX_TOUR_STORE_VERSION,
  whitelist: ["completed"]
};

export const persistedReducer = persistReducer<TourState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;
