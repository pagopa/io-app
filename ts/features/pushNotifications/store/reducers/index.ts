import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial,
  persistReducer
} from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { isDevEnv } from "../../../../utils/environment";
import { userFromSuccessLoginSelector } from "../../../login/info/store/selectors";
import { hasUserSeenSystemNotificationsPromptSelector } from "../selectors";
import { environmentReducer, EnvironmentState } from "./environment";
import { installationReducer, InstallationState } from "./installation";
import { pendingMessageReducer, PendingMessageState } from "./pendingMessage";
import { userBehaviourReducer, UserBehaviourState } from "./userBehaviour";

export const NOTIFICATIONS_STORE_VERSION = 0;

export type PersistedNotificationsState = NotificationsState & PersistPartial;

const migrations: MigrationManifest = {
  // Add new push notifications banner dismissal feature, also removal of old engagement screen logic
  "0": (state: PersistedState) => ({
    ...state,
    userBehaviour: {
      pushNotificationBannerDismissalCount: 0,
      pushNotificationBannerForceDismissionDate: undefined
    }
  })
};

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
  environment: EnvironmentState;
  userBehaviour: UserBehaviourState;
};

export const notificationsPersistConfig: PersistConfig = {
  key: "notifications",
  storage: AsyncStorage,
  version: NOTIFICATIONS_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  whitelist: ["installation", "pendingMessage", "userBehaviour"]
};

export const notificationsReducer = combineReducers<NotificationsState, Action>(
  {
    environment: environmentReducer,
    installation: installationReducer,
    pendingMessage: pendingMessageReducer,
    userBehaviour: userBehaviourReducer
  }
);

export const persistedNotificationsReducer = persistReducer<
  NotificationsState,
  Action
>(notificationsPersistConfig, notificationsReducer);

export const shouldShowEngagementScreenSelector = (state: GlobalState) =>
  userFromSuccessLoginSelector(state) &&
  !state.notifications.environment.systemNotificationsEnabled &&
  !hasUserSeenSystemNotificationsPromptSelector(state) &&
  state.notifications.environment.applicationInitialized &&
  !state.notifications.environment.onboardingInstructionsShown;
