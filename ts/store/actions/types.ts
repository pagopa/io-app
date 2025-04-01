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
import { AppearanceSettingsActions } from "../../features/appearanceSettings/store/actions";
import { BonusActions } from "../../features/bonus/common/store/actions";
import {
  CieLoginConfigActions,
  CieAuthenticationActions
} from "../../features/authentication/login/cie/store/actions";
import { FastLoginActions } from "../../features/authentication/fastLogin/store/actions";
import { FciActions } from "../../features/fci/store/actions";
import { FimsActions } from "../../features/fims/common/store/actions";
import { IdPayActions } from "../../features/idpay/common/store/actions";
import { IngressScreenActions } from "../../features/ingress/store/actions";
import { ItwActions } from "../../features/itwallet/common/store/actions";
import { LandingScreenBannerActions } from "../../features/landingScreenMultiBanner/store/actions";
import { LollipopActions } from "../../features/lollipop/store/actions/lollipop";
import { MessagesActions } from "../../features/messages/store/actions";
import { MixpanelFeatureActions } from "../../features/mixpanel/store/actions";
import { PaymentsActions as PaymentsFeatureActions } from "../../features/payments/common/store/actions";
import { PnActions } from "../../features/pn/store/actions";
import { NotificationPermissionsActions } from "../../features/pushNotifications/store/actions/environment";
import { NotificationsActions } from "../../features/pushNotifications/store/actions/installation";
import { PendingMessageActions } from "../../features/pushNotifications/store/actions/pendingMessage";
import { ProfileNotificationPermissionsActions } from "../../features/pushNotifications/store/actions/profileNotificationPermissions";
import { UserBehaviourActions } from "../../features/pushNotifications/store/actions/userBehaviour";
import { ServicesActions } from "../../features/services/common/store/actions";
import { SpidConfigActions } from "../../features/authentication/login/idp/store/actions";
import { AppFeedbackActions } from "../../features/appReviews/store/actions";
import { UtmLinkActions } from "../../features/utmLink/store/actions";
import { TrialSystemActions } from "../../features/trialSystem/store/actions";
import { WalletActions } from "../../features/wallet/store/actions";
import { WhatsNewActions } from "../../features/whatsnew/store/actions";
import { ZendeskSupportActions } from "../../features/zendesk/store/actions";
import { GlobalState } from "../reducers/types";
import { ConnectivityActions } from "../../features/connectivity/store/actions";
import { LoginPreferencesActions } from "../../features/authentication/loginPreferences/store/actions";
import { AuthenticationActions } from "../../features/authentication/common/store/actions";
import { ProfileActions } from "../../features/settings/store/actions";
import { UserDataProcessingActions } from "../../features/settings/store/actions/userDataProcessing";
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { BackendStatusActions } from "./backendStatus";
import { CalendarEventsActions } from "./calendarEvents";
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
import { ProfileEmailValidationAction } from "./profileEmailValidationChange";
import { SearchActions } from "./search";
import { StartupActions } from "./startup";

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
  | AppearanceSettingsActions
  | IngressScreenActions
  | MixpanelFeatureActions
  | LandingScreenBannerActions
  | SpidConfigActions
  | AppFeedbackActions
  | UtmLinkActions
  | ConnectivityActions
  | LoginPreferencesActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
