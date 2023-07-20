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

import { BonusActions } from "../../features/bonus/bonusVacanze/store/actions/bonusVacanze";
import { BpdActions } from "../../features/bonus/bpd/store/actions";
import { CgnActions } from "../../features/bonus/cgn/store/actions";
import { SvActions } from "../../features/bonus/siciliaVola/store/actions";
import { EuCovidCertActions } from "../../features/euCovidCert/store/actions";
import { AbiActions } from "../../features/wallet/onboarding/bancomat/store/actions";
import { BPayActions } from "../../features/wallet/onboarding/bancomatPay/store/actions";
import { CoBadgeActions } from "../../features/wallet/onboarding/cobadge/store/actions";
import { PayPalOnboardingActions } from "../../features/wallet/onboarding/paypal/store/actions";
import { SatispayActions } from "../../features/wallet/onboarding/satispay/store/actions";
import { ZendeskSupportActions } from "../../features/zendesk/store/actions";
import { GlobalState } from "../reducers/types";
import { CdcActions } from "../../features/bonus/cdc/store/actions";
import { PnActions } from "../../features/pn/store/actions";
import { FciActions } from "../../features/fci/store/actions";
import { IDPayActions } from "../../features/idpay/common/actions";
import { LollipopActions } from "../../features/lollipop/store/actions/lollipop";
import { FastLoginActions } from "../../features/fastLogin/store/actions";
import { WhatsNewActions } from "../../features/whatsnew/store/actions";
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
import { MessagesActions } from "./messages";
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
import { UserDataProcessingActions } from "./userDataProcessing";
import { UserMetadataActions } from "./userMetadata";
import { WalletActions } from "./wallet";
import { OutcomeCodeActions } from "./wallet/outcomeCode";
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
  | BpdActions
  | AbiActions
  | BPayActions
  | CoBadgeActions
  | SatispayActions
  | PayPalOnboardingActions
  | CrossSessionsActions
  | CgnActions
  | EuCovidCertActions
  | OutcomeCodeActions
  | SvActions
  | ZendeskSupportActions
  | CdcActions
  | PnActions
  | StartupActions
  | FciActions
  | IDPayActions
  | LollipopActions
  | FastLoginActions
  | WhatsNewActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
