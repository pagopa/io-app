import { ActionType, getType } from "typesafe-actions";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MigrationManifest,
  PersistConfig,
  PersistPartial,
  createMigrate,
  persistReducer
} from "redux-persist";
import { Action } from "../../../store/actions/types";
import { isDevEnv } from "../../../utils/environment";
import {
  LANDING_SCREEN_BANNERS_ENABLED_MAP,
  LandingScreenBannerId
} from "../utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "./actions";

type LandingScreenBannerStateEntries = {
  [key in LandingScreenBannerId]?: boolean;
};
export type LandingScreenBannerState = {
  session: LandingScreenBannerStateEntries;
  persisted: LandingScreenBannerStateEntries;
};

const INITIAL_STATE = {
  session: LANDING_SCREEN_BANNERS_ENABLED_MAP, // the visibility of a banner during this session, gets reset on restart
  persisted: {} // visibility which should be persisted between sessions
};

const landingScreenBannersReducer = (
  state: LandingScreenBannerState = INITIAL_STATE,
  action: Action
) => {
  switch (action.type) {
    case getType(updateLandingScreenBannerVisibility):
      // this is to avoid possible invalid ids to be written in store
      const { payload } = action;
      if (state.session[payload.id] !== undefined) {
        return {
          session: {
            ...state.session,
            [payload.id]: payload.enabled
          },
          persisted: {
            ...state.persisted,
            ...getMaybePersistedEntry(action)
          }
        };
      }
  }
  return state;
};

// -------------------- UTILS --------------------

const getMaybePersistedEntry = (
  action: ActionType<typeof updateLandingScreenBannerVisibility>
) =>
  action.payload.shouldBePersisted === true
    ? { [action.payload.id]: action.payload.enabled }
    : {};

/*
 * Merges the persisted state into the session state.
 * This way, the session-wide state is initialized with the persisted state,
 * making it so the current logic is not hindered by the persisted state.
 */
const mergePersistedIntoSession = (
  persistState: LandingScreenBannerState = INITIAL_STATE,
  storeState: LandingScreenBannerState = INITIAL_STATE
): LandingScreenBannerState => ({
  session: {
    ...storeState.session,
    ...persistState.persisted
  },
  persisted: { ...persistState.persisted }
});

// ----------------- PERSISTANCE -----------------
const CURRENT_REDUX_LANDING_SCREEN_BANNER_STORE_VERSION = 0;
const migrations: MigrationManifest = {
  "0": state => {
    const prevState = state as LandingScreenBannerState & PersistPartial;
    return {
      ...prevState
    };
  }
};

const persistConfig: PersistConfig = {
  key: "landingScreenBanners",
  storage: AsyncStorage,
  version: CURRENT_REDUX_LANDING_SCREEN_BANNER_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: ["persisted"],
  stateReconciler: mergePersistedIntoSession
};

export const persistedLandingScreenBannersReducer = persistReducer(
  persistConfig,
  landingScreenBannersReducer
);
