/**
 * Defines types for the available actions and store related stuff.
 */
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";

import { BonusActions } from "../../features/bonus/bonusVacanze/store/actions/bonusVacanze";
import { BpdActions } from "../../features/bonus/bpd/store/actions";
import { GlobalState } from "../reducers/types";
import { AbiActions } from "../../features/wallet/onboarding/bancomat/store/actions";
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { AuthenticationActions } from "./authentication";
import { BackendInfoActions } from "./backendInfo";
import { BackendStatusActions } from "./backendStatus";
import { CalendarEventsActions } from "./calendarEvents";
import { CieAuthenticationActions } from "./cie";
import { ContentActions } from "./content";
import { DebugActions } from "./debug";
import { DeepLinkActions } from "./deepLink";
import { IdentificationActions } from "./identification";
import { InstabugInfoActions } from "./instabug";
import { InstallationActions } from "./installation";
import { MessagesActions } from "./messages";
import { NavigationActions } from "./navigation";
import { NavigationHistoryActions } from "./navigationHistory";
import { NotificationsActions } from "./notifications";
import { OnboardingActions } from "./onboarding";
import { OrganizationsActions } from "./organizations";
import { PaymentsActions } from "./payments";
import { PersistedPreferencesActions } from "./persistedPreferences";
import { PinSetActions } from "./pinset";
import { PreferencesActions } from "./preferences";
import { ProfileActions } from "./profile";
import { ProfileEmailValidationAction } from "./profileEmailValidationChange";
import { SearchActions } from "./search";
import { ServicesActions } from "./services";
import { UserDataProcessingActions } from "./userDataProcessing";
import { UserMetadataActions } from "./userMetadata";
import { WalletActions } from "./wallet";
import { InternalRouteNavigationActions } from "./internalRouteNavigation";

export type Action =
  | AnalyticsActions
  | ApplicationActions
  | AuthenticationActions
  | BackendStatusActions
  | CieAuthenticationActions
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
  | UserMetadataActions
  | ServicesActions
  | WalletActions
  | ContentActions
  | NavigationHistoryActions
  | IdentificationActions
  | InstallationActions
  | DebugActions
  | CalendarEventsActions
  | SearchActions
  | PaymentsActions
  | OrganizationsActions
  | InstabugInfoActions
  | InternalRouteNavigationActions
  | UserDataProcessingActions
  | ProfileEmailValidationAction
  | BonusActions
  | BpdActions
  | AbiActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
