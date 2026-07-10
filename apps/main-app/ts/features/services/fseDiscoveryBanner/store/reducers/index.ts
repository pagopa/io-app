import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { Action } from "../../../../../store/actions/types";
import { persistedDismissFseDiscoveryBanner } from "../actions";

export type FseDiscoveryBannerState = {
  isDismissed: boolean;
};

export const fseDiscoveryBannerInitialState: FseDiscoveryBannerState = {
  isDismissed: false
};

export const fseDiscoveryBannerReducer = (
  state: FseDiscoveryBannerState = fseDiscoveryBannerInitialState,
  action: Action
): FseDiscoveryBannerState => {
  switch (action.type) {
    case getType(persistedDismissFseDiscoveryBanner):
      return {
        isDismissed: true
      };
    case getType(differentProfileLoggedIn):
      return fseDiscoveryBannerInitialState;
  }
  return state;
};

const persistConfig: PersistConfig = {
  key: "fseDiscoveryBanner",
  storage: AsyncStorage,
  whitelist: ["isDismissed"] satisfies Array<keyof FseDiscoveryBannerState>
};

export const fseDiscoveryBannerPersistor = persistReducer<
  FseDiscoveryBannerState,
  Action
>(persistConfig, fseDiscoveryBannerReducer);
