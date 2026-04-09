import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { closeCgnDiscoveryBanner } from "../actions/banners";

export type CgnBannersState = {
  discoveryBannerClosed: boolean;
};

const initialState: CgnBannersState = {
  discoveryBannerClosed: false
};

const cgnBannersReducer = (
  state: CgnBannersState = initialState,
  action: Action
): CgnBannersState => {
  switch (action.type) {
    case getType(closeCgnDiscoveryBanner):
      return {
        ...state,
        discoveryBannerClosed: true
      };
    case getType(differentProfileLoggedIn):
      return initialState;
    default:
      return state;
  }
};

const persistConfig: PersistConfig = {
  key: "cgnBanners",
  storage: AsyncStorage
};

export const cgnBannersPersistent = persistReducer(
  persistConfig,
  cgnBannersReducer
);

export const isCgnDiscoveryBannerClosedSelector = (state: GlobalState) =>
  state.bonus.cgn.banners.discoveryBannerClosed;
