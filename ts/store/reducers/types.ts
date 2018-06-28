import { NavigationState } from "react-navigation";
import { FormStateMap } from "redux-form";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { PersistedAuthenticationState } from "./authentication";
import { EntitiesState } from "./entities";
import { ErrorState } from "./error";
import { LoadingState } from "./loading";
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
  network: NetworkState;
  navigation: NavigationState;
  loading: LoadingState;
  error: ErrorState;
  form: FormStateMap;
  authentication: PersistedAuthenticationState;
  onboarding: OnboardingState;
  notifications: NotificationsState;
  profile: ProfileState;
  wallet: WalletState;
  entities: EntitiesState;
  pinlogin: PinLoginState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
