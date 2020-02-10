import { NavigationState } from "react-navigation";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { PersistedAuthenticationState } from "./authentication";
import { BackendInfoState } from "./backendInfo";
import { ContentState } from "./content";
import { DebugState } from "./debug";
import { DeepLinkState } from "./deepLink";
import { EmailValidationState } from "./emailValidation";
import { EntitiesState } from "./entities";
import { IdentificationState } from "./identification";
import { InstabugUnreadMessagesState } from "./instabug/instabugUnreadMessages";
import { InstallationState } from "./installation";
import { NavigationHistoryState } from "./navigationHistory";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PaymentsState } from "./payments";
import { PersistedPreferencesState } from "./persistedPreferences";
import { PreferencesState } from "./preferences";
import { ProfileState } from "./profile";
import { SearchState } from "./search";
import { UserMetadataState } from "./userMetadata";
import { WalletState } from "./wallet";

type NetworkState = Readonly<{
  isConnected: boolean;
  actionQueue: ReadonlyArray<Action>;
}>;

export type GlobalState = Readonly<{
  appState: AppState;
  authentication: PersistedAuthenticationState;
  backendInfo: BackendInfoState;
  deepLink: DeepLinkState;
  entities: EntitiesState;
  instabug: InstabugUnreadMessagesState;
  nav: NavigationState;
  network: NetworkState;
  notifications: NotificationsState;
  onboarding: OnboardingState;
  profile: ProfileState;
  wallet: WalletState;
  preferences: PreferencesState;
  persistedPreferences: PersistedPreferencesState;
  content: ContentState;
  navigationHistory: NavigationHistoryState;
  identification: IdentificationState;
  installation: InstallationState;
  debug: DebugState;
  search: SearchState;
  payments: PaymentsState;
  userMetadata: UserMetadataState;
  emailValidation: EmailValidationState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
