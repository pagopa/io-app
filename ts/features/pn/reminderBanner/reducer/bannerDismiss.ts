import * as pot from "@pagopa/ts-commons/lib/pot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MigrationManifest,
  PersistConfig,
  PersistedState,
  createMigrate,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";
import { Action } from "../../../../store/actions/types";
import {
  isPnRemoteEnabledSelector,
  pnMessagingServiceIdSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { servicePreferenceByChannelPotSelector } from "../../../services/details/store/selectors";
import { dismissPnActivationReminderBanner } from "../../store/actions";
import { isDevEnv, isTestEnv } from "../../../../utils/environment";

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
const CURRENT_STORE_VERSION = 0;
const migrations: MigrationManifest = {
  // the dismission state is reset to analyze the behaviour of the banner's new UI
  "0": state =>
    ({
      ...state,
      dismissed: false
    } as PersistedState)
};

const persistConfig: PersistConfig = {
  key: "pnBannerDismiss",
  storage: AsyncStorage,
  version: CURRENT_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: ["dismissed"]
};

export const persistedPnBannerDismissReducer = persistReducer(
  persistConfig,
  pnBannerDismissReducer
);
export const isPnServiceEnabled = (state: GlobalState) => {
  const pnServiceId = pnMessagingServiceIdSelector(state);
  return pot.getOrElse(
    servicePreferenceByChannelPotSelector(state, pnServiceId, "inbox"),
    undefined
  );
};
export const isPnActivationReminderBannerRenderableSelector = (
  state: GlobalState
) => {
  const hasBannerBeenDismissed =
    state.features.pn.bannerDismiss.dismissed === true;
  const isPnRemoteEnabled = isPnRemoteEnabledSelector(state);
  const isPnInboxEnabled = isPnServiceEnabled(state) ?? true;

  return isPnRemoteEnabled && !hasBannerBeenDismissed && !isPnInboxEnabled;
};

export const testable = isTestEnv
  ? { CURRENT_STORE_VERSION, migrations }
  : undefined;
