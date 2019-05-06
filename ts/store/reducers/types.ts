import { NavigationState } from "react-navigation";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { PersistedAuthenticationState } from "./authentication";
import { BackendInfoState } from "./backendInfo";
import { ContentState } from "./content";
import { DebugState } from "./debug";
import { DeepLinkState } from "./deepLink";
import { EntitiesState } from "./entities";
import { IdentificationState } from "./identification";
import { InstallationState } from "./installation";
import { NavigationHistoryState } from "./navigationHistory";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PersistedPreferencesState } from "./persistedPreferences";
import { PreferencesState } from "./preferences";
import { ProfileState } from "./profile";
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
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
