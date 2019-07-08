/**
 * Defines types for the available actions and store related stuff.
 */
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";

import { GlobalState } from "../reducers/types";
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { AuthenticationActions } from "./authentication";
import { BackendInfoActions } from "./backendInfo";
import { CalendarEventsActions } from "./calendarEvents";
import { ContentActions } from "./content";
import { DebugActions } from "./debug";
import { DeepLinkActions } from "./deepLink";
import { IdentificationActions } from "./identification";
import { InstallationActions } from "./installation";
import { MessagesActions } from "./messages";
import { NavigationActions } from "./navigation";
import { NavigationHistoryActions } from "./navigationHistory";
import { NotificationsActions } from "./notifications";
import { OnboardingActions } from "./onboarding";
import { PaymentsActions } from "./payments";
import { PersistedPreferencesActions } from "./persistedPreferences";
import { PinSetActions } from "./pinset";
import { PreferencesActions } from "./preferences";
import { ProfileActions } from "./profile";
import { SearchActions } from "./search";
import { ServicesActions } from "./services";
import { WalletActions } from "./wallet";

export type Action =
  | AnalyticsActions
  | ApplicationActions
  | AuthenticationActions
  | BackendInfoActions
  | DeepLinkActions
  | MessagesActions
  | NavigationActions
  | NotificationsActions
  | PinSetActions
  | OnboardingActions
  | PreferencesActions
  | PersistedPreferencesActions
  | ProfileActions
  | ServicesActions
  | WalletActions
  | ContentActions
  | NavigationHistoryActions
  | IdentificationActions
  | InstallationActions
  | DebugActions
  | CalendarEventsActions
  | SearchActions
  | PaymentsActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
