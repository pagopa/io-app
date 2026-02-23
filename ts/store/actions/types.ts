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
import { AppFeedbackActions } from "../../features/appReviews/store/actions";
import { AppearanceSettingsActions } from "../../features/appearanceSettings/store/actions";
import { LoginInfoActions } from "../../features/authentication/activeSessionLogin/store/actions";
import { AuthenticationActions } from "../../features/authentication/common/store/actions";
import { FastLoginActions } from "../../features/authentication/fastLogin/store/actions";
import {
  CieAuthenticationActions,
  CieLoginConfigActions
} from "../../features/authentication/login/cie/store/actions";
import { SpidConfigActions } from "../../features/authentication/login/idp/store/actions";
import { BonusActions } from "../../features/bonus/common/store/actions";
import { ConnectivityActions } from "../../features/connectivity/store/actions";
import { FciActions } from "../../features/fci/store/actions";
import { FimsActions } from "../../features/fims/common/store/actions";
import { IdentificationActions } from "../../features/identification/store/actions";
import { IdPayActions } from "../../features/idpay/common/store/actions";
import { IngressScreenActions } from "../../features/ingress/store/actions";
import { ItwActions } from "../../features/itwallet/common/store/actions";
import { LandingScreenBannerActions } from "../../features/landingScreenMultiBanner/store/actions";
import { BackgroundLinkingActions } from "../../features/linking/actions";
import { LollipopActions } from "../../features/lollipop/store/actions/lollipop";
import { ProfileEmailValidationAction } from "../../features/mailCheck/store/actions/profileEmailValidationChange";
import { MessagesActions } from "../../features/messages/store/actions";
import { MixpanelFeatureActions } from "../../features/mixpanel/store/actions";
import { OnboardingActions } from "../../features/onboarding/store/actions";
import { PaymentsActions as PaymentsFeatureActions } from "../../features/payments/common/store/actions";
import { AARFlowStateActions } from "../../features/pn/aar/store/actions";
import { PnActions } from "../../features/pn/store/actions";
import { NotificationPermissionsActions } from "../../features/pushNotifications/store/actions/environment";
import { NotificationsActions } from "../../features/pushNotifications/store/actions/installation";
import { PendingMessageActions } from "../../features/pushNotifications/store/actions/pendingMessage";
import { ProfileNotificationPermissionsActions } from "../../features/pushNotifications/store/actions/profileNotificationPermissions";
import { UserBehaviourActions } from "../../features/pushNotifications/store/actions/userBehaviour";
import { ServicesActions } from "../../features/services/common/store/actions";
import { ProfileActions } from "../../features/settings/common/store/actions";
import { UserDataProcessingActions } from "../../features/settings/common/store/actions/userDataProcessing";
import { PinSetActions } from "../../features/settings/security/store/actions/pinset";
import { UtmLinkActions } from "../../features/utmLink/store/actions";
import { WalletActions } from "../../features/wallet/store/actions";
import { WhatsNewActions } from "../../features/whatsnew/store/actions";
import { ZendeskSupportActions } from "../../features/zendesk/store/actions";
import { GlobalState } from "../reducers/types";
import { SENDLoginEngagementActions } from "../../features/pn/loginEngagement/store/actions";
import { CdcActions } from "../../features/bonus/cdc/common/store/actions";
import { SENDLollipopLambdaActions } from "../../features/pn/lollipopLambda/store/actions";
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { BackendStatusActions } from "./backendStatus";
import { CalendarEventsActions } from "./calendarEvents";
import { ContentActions } from "./content";
import { CrossSessionsActions } from "./crossSessions";
import { DebugActions } from "./debug";
import { InstallationActions } from "./installation";
import { MixpanelActions } from "./mixpanel";
import { OrganizationsActions } from "./organizations";
import { PersistedPreferencesActions } from "./persistedPreferences";
import { PreferencesActions } from "./preferences";
import { SearchActions } from "./search";
import { StartupActions } from "./startup";

export type Action =
  | AnalyticsActions
  | ApplicationActions
  | AuthenticationActions
  | BackendStatusActions
  | CieAuthenticationActions
  | LoginInfoActions
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
  | AppearanceSettingsActions
  | IngressScreenActions
  | MixpanelFeatureActions
  | LandingScreenBannerActions
  | SpidConfigActions
  | AppFeedbackActions
  | UtmLinkActions
  | ConnectivityActions
  | AARFlowStateActions
  | SENDLollipopLambdaActions
  | BackgroundLinkingActions
  | SENDLoginEngagementActions
  | CdcActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
