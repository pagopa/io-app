import { FormStateMap } from "redux-form";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { BackendInfoState } from "./backendInfo";
import { DeeplinkState } from "./deeplink";
import { EntitiesState } from "./entities";
import { ErrorState } from "./error";
import { LoadingState } from "./loading";
import { NavigationState } from "./navigation";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PinLoginState } from "./pinlogin";
import { ProfileState } from "./profile";
import { WalletState } from "./wallet";

export type NetworkState = Readonly<{
  isConnected: boolean;
  actionQueue: ReadonlyArray<Action>;
}>;

export type GlobalState = Readonly<{
  appState: AppState;
  backendInfo: BackendInfoState;
  deeplink: DeeplinkState;
  entities: EntitiesState;
  error: ErrorState;
  form: FormStateMap;
  loading: LoadingState;
  nav: NavigationState;
  navigation: NavigationState;
  network: NetworkState;
  notifications: NotificationsState;
  onboarding: OnboardingState;
  pinlogin: PinLoginState;
  profile: ProfileState;
  wallet: WalletState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
