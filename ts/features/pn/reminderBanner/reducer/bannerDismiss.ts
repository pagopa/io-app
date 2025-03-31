import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { dismissPnActivationReminderBanner } from "../../store/actions";
import { GlobalState } from "../../../../store/reducers/types";
import { isPnEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../features/authentication/common/store/actions";

export type PnBannerDismissState = {
  dismissed: boolean;
};
const INITIAL_STATE = {
  dismissed: false
};

const pnBannerDismissReducer = (
  state: PnBannerDismissState = INITIAL_STATE,
  action: Action
) => {
  switch (action.type) {
    case getType(dismissPnActivationReminderBanner):
      return {
        dismissed: true
      };
    // Logout changes are handled here in order to make
    // sure that they are immediately persisted
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return INITIAL_STATE;
  }
  return state;
};
const persistConfig = {
  key: "pnBannerDismiss",
  storage: AsyncStorage,
  version: -1,
  whitelist: ["dismissed"]
};
export const persistedPnBannerDismissReducer = persistReducer(
  persistConfig,
  pnBannerDismissReducer
);
export const isPnActivationReminderBannerRenderableSelector = (
  state: GlobalState
) => {
  const isPnEnabled = isPnEnabledSelector(state);
  const hasBeenDismissed = state.features.pn.bannerDismiss.dismissed === true;
  return isPnEnabled && !hasBeenDismissed;
};
