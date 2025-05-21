import * as pot from "@pagopa/ts-commons/lib/pot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { Action } from "../../../../store/actions/types";
import {
  isPnRemoteEnabledSelector,
  pnMessagingServiceIdSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { servicePreferenceByChannelPotSelector } from "../../../services/details/store/reducers";
import { dismissPnActivationReminderBanner } from "../../store/actions";

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
    // the dismiss state has to be reset when, after logging out, the user logs in with a different profile
    case getType(differentProfileLoggedIn):
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
  const pnServiceId = pnMessagingServiceIdSelector(state);

  const hasBannerBeenDismissed =
    state.features.pn.bannerDismiss.dismissed === true;
  const isPnRemoteEnabled = isPnRemoteEnabledSelector(state);
  const isPnInboxEnabled = pot.getOrElse(
    servicePreferenceByChannelPotSelector(state, pnServiceId, "inbox"),
    false
  );

  return isPnRemoteEnabled && !hasBannerBeenDismissed && !isPnInboxEnabled;
};
