/**
 * Defines types for the available actions and store related stuff.
 */

import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";

import { GlobalState } from "../reducers/types";
import { ApplicationActions } from "./application";
import { AuthenticationActions } from "./authentication";
import { BackendInfoActions } from "./backendInfo";
import { APP_STATE_CHANGE_ACTION } from "./constants";
import { DeepLinkActions } from "./deepLink";
import { ErrorActions } from "./error";
import { MessagesActions } from "./messages";
import { NavigationActions } from "./navigation";
import { NotificationsActions } from "./notifications";
import { OnboardingActions } from "./onboarding";
import { PinloginActions } from "./pinlogin";
import { PinSetActions } from "./pinset";
import { PreferencesActions } from "./preferences";
import { ProfileActions } from "./profile";
import { ServicesActions } from "./services";
import { WalletActions } from "./wallet";

export type ApplicationState = "background" | "inactive" | "active";

export type ApplicationStateAction = Readonly<{
  type: typeof APP_STATE_CHANGE_ACTION;
  payload: ApplicationState;
}>;

export type Action =
  | ApplicationActions
  | ApplicationStateAction
  | AuthenticationActions
  | BackendInfoActions
  | DeepLinkActions
  | ErrorActions
  | MessagesActions
  | NavigationActions
  | NotificationsActions
  | PinSetActions
  | OnboardingActions
  | PinloginActions
  | PreferencesActions
  | ProfileActions
  | ServicesActions
  | WalletActions;

export type GetState = () => GlobalState;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
