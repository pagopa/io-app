import { NavigationState } from "react-navigation";
import { FormStateMap } from "redux-form";
import { PersistPartial } from "redux-persist";

import { Action } from "../actions/types";
import { AppState } from "./appState";
import { DeeplinkState } from "./deeplink";
import { EntitiesState } from "./entities";
import { ErrorState } from "./error";
import { LoadingState } from "./loading";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PinLoginState } from "./pinlogin";
import { ProfileState } from "./profile";
import { PersistedSessionState } from "./session";
import { WalletState } from "./wallet";

export type NetworkState = Readonly<{
  isConnected: boolean;
  actionQueue: ReadonlyArray<Action>;
}>;

export type GlobalState = Readonly<{
  appState: AppState;
  deeplink: DeeplinkState;
  entities: EntitiesState;
  error: ErrorState;
  form: FormStateMap;
  loading: LoadingState;
  navigation: NavigationState;
  network: NetworkState;
  notifications: NotificationsState;
  onboarding: OnboardingState;
  pinlogin: PinLoginState;
  profile: ProfileState;
  session: PersistedSessionState;
  wallet: WalletState;
}>;

export type PersistedGlobalState = GlobalState & PersistPartial;
