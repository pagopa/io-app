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
import { AnalyticsActions } from "./analytics";
import { ApplicationActions } from "./application";
import { AuthenticationActions } from "./authentication";
import { BackendInfoActions } from "./backendInfo";
import { ContentActions } from "./content";
import { DeepLinkActions } from "./deepLink";
import { ErrorActions } from "./error";
import { IdentificationActions } from "./identification";
import { MessagesActions } from "./messages";
import { NavigationActions } from "./navigation";
import { NavigationHistoryActions } from "./navigationHistory";
import { NotificationsActions } from "./notifications";
import { OnboardingActions } from "./onboarding";
import { PinloginActions } from "./pinlogin";
import { PinSetActions } from "./pinset";
import { PreferencesActions } from "./preferences";
import { ProfileActions } from "./profile";
import { ServicesActions } from "./services";
import { WalletActions } from "./wallet";

export type Action =
  | AnalyticsActions
  | ApplicationActions
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
  | WalletActions
  | ContentActions
  | NavigationHistoryActions
  | IdentificationActions;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState, Action>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
