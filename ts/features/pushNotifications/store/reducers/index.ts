import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../login/info/store/selectors";
import { hasUserSeenSystemNotificationsPromptSelector } from "../selectors";
import { EnvironmentState, environmentReducer } from "./environment";
import { InstallationState, installationReducer } from "./installation";
import { PendingMessageState, pendingMessageReducer } from "./pendingMessage";
import { UserBehaviourState, userBehaviourReducer } from "./userBehaviour";

export const NOTIFICATIONS_STORE_VERSION = -1;

export type PersistedNotificationsState = NotificationsState & PersistPartial;

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
  !state.notifications.userBehaviour.engagementScreenShown && // user hasn't already seen the screen
  state.notifications.environment.applicationInitialized &&
  !state.notifications.environment.onboardingInstructionsShown;
