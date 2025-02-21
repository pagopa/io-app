/**
 * Defines types for the available actions and store related stuff.
 */
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";
import { VersionInfoActions } from "../../common/versionInfo/store/actions/versionInfo";
import { BonusActions } from "../../features/bonus/common/store/actions";
import { FastLoginActions } from "../../features/fastLogin/store/actions";
import { FciActions } from "../../features/fci/store/actions";
import { IdPayActions } from "../../features/idpay/common/store/actions";
import { LollipopActions } from "../../features/lollipop/store/actions/lollipop";
import { MessagesActions } from "../../features/messages/store/actions";
import { WalletActions } from "../../features/wallet/store/actions";
import { PaymentsActions as PaymentsFeatureActions } from "../../features/payments/common/store/actions";
import { PnActions } from "../../features/pn/store/actions";
import { ServicesActions } from "../../features/services/common/store/actions";
import { WhatsNewActions } from "../../features/whatsnew/store/actions";
import { ZendeskSupportActions } from "../../features/zendesk/store/actions";
import { NotificationsActions } from "../../features/pushNotifications/store/actions/installation";
import { NotificationPermissionsActions } from "../../features/pushNotifications/store/actions/environment";
import { PendingMessageActions } from "../../features/pushNotifications/store/actions/pendingMessage";
import { ProfileNotificationPermissionsActions } from "../../features/pushNotifications/store/actions/profileNotificationPermissions";
import { UserBehaviourActions } from "../../features/pushNotifications/store/actions/userBehaviour";
import { GlobalState } from "../reducers/types";
import { CieLoginConfigActions } from "../../features/cieLogin/store/actions";
import { FimsActions } from "../../features/fims/common/store/actions";
import { ItwActions } from "../../features/itwallet/common/store/actions";
import { TrialSystemActions } from "../../features/trialSystem/store/actions";
import { ProfileSettingsActions } from "../../features/profileSettings/store/actions";
import { IngressScreenActions } from "../../features/ingress/store/actions";
import { MixpanelFeatureActions } from "../../features/mixpanel/store/actions";
import { LandingScreenBannerActions } from "../../features/landingScreenMultiBanner/store/actions";
import { SpidConfigActions } from "../../features/spidLogin/store/actions";
import { LoginPreferencesActions } from "../../features/login/preferences/store/actions";
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { AuthenticationActions } from "./authentication";
import { BackendStatusActions } from "./backendStatus";
import { CalendarEventsActions } from "./calendarEvents";
import { CieAuthenticationActions } from "./cie";
import { ContentActions } from "./content";
import { CrossSessionsActions } from "./crossSessions";
import { DebugActions } from "./debug";
import { IdentificationActions } from "./identification";
import { InstallationActions } from "./installation";
import { MixpanelActions } from "./mixpanel";
import { OnboardingActions } from "./onboarding";
import { OrganizationsActions } from "./organizations";
import { PersistedPreferencesActions } from "./persistedPreferences";
import { PinSetActions } from "./pinset";
import { PreferencesActions } from "./preferences";
import { ProfileActions } from "./profile";
import { ProfileEmailValidationAction } from "./profileEmailValidationChange";
import { SearchActions } from "./search";
import { StartupActions } from "./startup";
import { UserDataProcessingActions } from "./userDataProcessing";

export type Action =
  | AnalyticsActions
  | ApplicationActions
  | AuthenticationActions
  | BackendStatusActions
  | CieAuthenticationActions
  | VersionInfoActions
  | MessagesActions
  | MixpanelActions
  | NotificationsActions
  | NotificationPermissionsActions
  | PendingMessageActions
  | UserBehaviourActions
  | ProfileNotificationPermissionsActions
  | PinSetActions
  | OnboardingActions
  | PreferencesActions
  | PersistedPreferencesActions
  | ProfileActions
  | ServicesActions
  | ContentActions
  | IdentificationActions
  | InstallationActions
  | DebugActions
  | CalendarEventsActions
  | SearchActions
  | OrganizationsActions
  | UserDataProcessingActions
  | ProfileEmailValidationAction
  | BonusActions
  | CrossSessionsActions
  | ZendeskSupportActions
  | PnActions
  | StartupActions
  | FciActions
  | IdPayActions
  | LollipopActions
  | FastLoginActions
  | WhatsNewActions
  | PaymentsFeatureActions
  | WalletActions
  | CieLoginConfigActions
  | FimsActions
  | ItwActions
  | TrialSystemActions
  | ProfileSettingsActions
  | IngressScreenActions
  | MixpanelFeatureActions
  | LandingScreenBannerActions
  | SpidConfigActions
  | LoginPreferencesActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
