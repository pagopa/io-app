import { NavigationState } from "react-navigation";
import { FormStateMap } from "redux-form";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { PersistedAuthenticationState } from "./authentication";
import { BackendInfoState } from "./backendInfo";
import { ContentState } from "./content";
import { DeepLinkState } from "./deepLink";
import { EntitiesState } from "./entities";
import { ErrorState } from "./error";
import { IdentificationState } from "./identification";
import { LoadingState } from "./loading";
import { NavigationHistoryState } from "./navigationHistory";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PinLoginState } from "./pinlogin";
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
  error: ErrorState;
  form: FormStateMap;
  loading: LoadingState;
  nav: NavigationState;
  network: NetworkState;
  notifications: NotificationsState;
  onboarding: OnboardingState;
  pinlogin: PinLoginState;
  profile: ProfileState;
  wallet: WalletState;
  preferences: PreferencesState;
  content: ContentState;
  navigationHistory: NavigationHistoryState;
  identification: IdentificationState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
