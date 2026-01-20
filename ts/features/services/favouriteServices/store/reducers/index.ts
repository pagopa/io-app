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
import createSecureStorage from "../../../common/storages/secureStorage";
import { clearCurrentSession } from "../../../../authentication/common/store/actions";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";

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
          [action.payload.id]: action.payload
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
    case getType(clearCurrentSession):
    case getType(differentProfileLoggedIn): {
      return INITIAL_STATE;
    }
    default:
      return state;
  }
};

const CURRENT_REDUX_FAVOURITE_SERVICES_STORE_VERSION = -1;

const favouriteServicesPersistConfig: PersistConfig = {
  key: "favouriteServicesPersistConfig",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_FAVOURITE_SERVICES_STORE_VERSION
};

const persistedReducer = persistReducer(
  favouriteServicesPersistConfig,
  reducer
);

export default persistedReducer;
