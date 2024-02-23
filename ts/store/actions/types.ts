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
import { EuCovidCertActions } from "../../features/euCovidCert/store/actions";
import { FastLoginActions } from "../../features/fastLogin/store/actions";
import { FciActions } from "../../features/fci/store/actions";
import { IdPayActions } from "../../features/idpay/common/store/actions";
import { LollipopActions } from "../../features/lollipop/store/actions/lollipop";
import { MessagesActions } from "../../features/messages/store/actions";
import { PnActions } from "../../features/pn/store/actions";
import { AbiActions } from "../../features/wallet/onboarding/bancomat/store/actions";
import { BPayActions } from "../../features/wallet/onboarding/bancomatPay/store/actions";
import { CoBadgeActions } from "../../features/wallet/onboarding/cobadge/store/actions";
import { PayPalOnboardingActions } from "../../features/wallet/onboarding/paypal/store/actions";
import { PaymentsActions as PaymentsFeatureActions } from "../../features/payments/common/store/actions";
import { WhatsNewActions } from "../../features/whatsnew/store/actions";
import { ZendeskSupportActions } from "../../features/zendesk/store/actions";
import { GlobalState } from "../reducers/types";
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
import { StartupActions } from "./startup";
import { UserDataProcessingActions } from "./userDataProcessing";
import { UserMetadataActions } from "./userMetadata";
import { WalletActions } from "./wallet";
import { OutcomeCodeActions } from "./wallet/outcomeCode";

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
  | PinSetActions
  | OnboardingActions
  | PreferencesActions
  | PersistedPreferencesActions
  | ProfileActions
  | UserMetadataActions
  | ServicesActions
  | WalletActions
  | ContentActions
  | IdentificationActions
  | InstallationActions
  | DebugActions
  | CalendarEventsActions
  | SearchActions
  | PaymentsActions
  | OrganizationsActions
  | UserDataProcessingActions
  | ProfileEmailValidationAction
  | BonusActions
  | AbiActions
  | BPayActions
  | CoBadgeActions
  | PayPalOnboardingActions
  | CrossSessionsActions
  | EuCovidCertActions
  | OutcomeCodeActions
  | ZendeskSupportActions
  | PnActions
  | StartupActions
  | FciActions
  | IdPayActions
  | LollipopActions
  | FastLoginActions
  | WhatsNewActions
  | PaymentsFeatureActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
