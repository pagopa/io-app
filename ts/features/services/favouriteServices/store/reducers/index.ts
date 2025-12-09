import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { FavouriteServiceType } from "../../../favouriteServices/types";
import {
  addFavouriteServiceSuccess,
  removeFavouriteService
} from "../../../favouriteServices/store/actions";

export type FavouriteServicesState = {
  dataById: Record<string, FavouriteServiceType>;
};

const INITIAL_STATE: FavouriteServicesState = {
  dataById: {}
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
