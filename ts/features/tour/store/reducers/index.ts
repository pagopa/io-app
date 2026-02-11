import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types.ts";
import { TourItem } from "../../types/index.ts";
import {
  registerTourItemAction,
  unregisterTourItemAction
} from "../actions/index.ts";

export type TourState = {
  // Registered items, indexed by their group id
  items: { [groupId: string]: ReadonlyArray<TourItem> };
  // Stored the ids of completed groups to avoid showing them again
  completed: Set<string>;
};

export const tourInitialState: TourState = {
  items: {},
  completed: new Set()
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
    default:
      return state;
  }
};

const CURRENT_REDUX_TOUR_STORE_VERSION = -1;

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
