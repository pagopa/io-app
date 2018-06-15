import { NavigationState } from "react-navigation";
import { FormStateMap } from "redux-form";
import { Action } from "../actions/types";
import { AppState } from "./appState";
import { EntitiesState } from "./entities";
import { ErrorState } from "./error";
import { LoadingState } from "./loading";
import { NotificationsState } from "./notifications";
import { OnboardingState } from "./onboarding";
import { PinLoginState } from "./pinlogin";
import { ProfileState } from "./profile";
import { SessionState } from "./session";

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
  session: SessionState;
  onboarding: OnboardingState;
  notifications: NotificationsState;
  profile: ProfileState;
  entities: EntitiesState;
  pinlogin: PinLoginState;
}>;
