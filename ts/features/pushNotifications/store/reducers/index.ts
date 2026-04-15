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
import { isDevEnv, isTestEnv } from "../../../../utils/environment";
import { userFromSuccessLoginSelector } from "../../../authentication/loginInfo/store/selectors";
import { hasUserSeenSystemNotificationsPromptSelector } from "../selectors";
import { generateTokenRegistrationTime } from "../../utils";
import { environmentReducer, EnvironmentState } from "./environment";
import {
  installationReducer,
  InstallationState,
  TokenRegistrationResendDelay,
  TokenStatus
} from "./installation";
import { pendingMessageReducer, PendingMessageState } from "./pendingMessage";
import { userBehaviourReducer, UserBehaviourState } from "./userBehaviour";

export const NOTIFICATIONS_STORE_VERSION = 1;

export type PersistedNotificationsState = NotificationsState & PersistPartial;

const migrations: MigrationManifest = {
  // Add new push notifications banner dismissal feature, also removal of old engagement screen logic
  "0": (state: PersistedState) => ({
    ...state,
    userBehaviour: {
      pushNotificationBannerDismissalCount: 0,
      pushNotificationBannerForceDismissionDate: undefined
    }
  }),
  "1": (state: PersistedState) => {
    const typedState = state as PersistedNotificationsState;
    const tokenRegistered =
      typedState.installation.token != null &&
      typedState.installation.token === typedState.installation.registeredToken;
    const newTokenStatus: TokenStatus = tokenRegistered
      ? {
          status: "sentUnconfirmed",
          date: generateTokenRegistrationTime() - TokenRegistrationResendDelay
        }
      : { status: "unsent" };
    return {
      ...typedState,
      installation: {
        ...typedState.installation,
        tokenStatus: newTokenStatus
      }
    };
  }
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

export const testable = isTestEnv ? { migrations } : undefined;
