import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import type {
  FavouriteServicesSortType,
  FavouriteServiceType
} from "../../../favouriteServices/types";
import {
  addFavouriteServiceSuccess,
  removeFavouriteService,
  setFavouriteServicesSortType
} from "../../../favouriteServices/store/actions";

export type FavouriteServicesState = {
  dataById: Record<string, FavouriteServiceType>;
  sortType: FavouriteServicesSortType;
};

const INITIAL_STATE: FavouriteServicesState = {
  dataById: {},
  sortType: "addedAt_desc"
};

const reducer = (
  state: FavouriteServicesState = INITIAL_STATE,
  action: Action
): FavouriteServicesState => {
  switch (action.type) {
    case getType(addFavouriteServiceSuccess): {
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [action.payload.id]: {
            ...action.payload,
            addedAt: Date.now()
          }
        }
      };
    }
    case getType(removeFavouriteService): {
      const { [action.payload.id]: _, ...rest } = state.dataById;
      return {
        ...state,
        dataById: rest
      };
    }
    case getType(setFavouriteServicesSortType): {
      return {
        ...state,
        sortType: action.payload
      };
    }
    default:
      return state;
  }
};

const CURRENT_REDUX_FAVOURITE_SERVICES_STORE_VERSION = -1;

const favouriteServicesPersistConfig: PersistConfig = {
  key: "favouriteServicesPersistConfig",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FAVOURITE_SERVICES_STORE_VERSION
};

const persistedReducer = persistReducer(
  favouriteServicesPersistConfig,
  reducer
);

export default persistedReducer;
