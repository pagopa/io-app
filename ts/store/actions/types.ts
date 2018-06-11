/**
 * Defines types for the available actions and store related stuff.
 */

import { NavigationAction } from "react-navigation";
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";

import { GlobalState } from "../reducers/types";
import { ApplicationActions } from "./application";
import { APP_STATE_CHANGE_ACTION } from "./constants";
import { ErrorActions } from "./error";
import { MessagesActions } from "./messages";
import { NotificationsActions } from "./notifications";
import { OnboardingActions } from "./onboarding";
import { PinloginActions } from "./pinlogin";
import { ProfileActions } from "./profile";
import { ServicesActions } from "./services";
import { SessionActions } from "./session";

export type ApplicationState = "background" | "inactive" | "active";

export type ApplicationStateAction = Readonly<{
  type: typeof APP_STATE_CHANGE_ACTION;
  payload: ApplicationState;
}>;

export type Action =
  | ApplicationActions
  | ApplicationStateAction
  | NavigationAction
  | SessionActions
  | OnboardingActions
  | NotificationsActions
  | PinloginActions
  | ProfileActions
  | MessagesActions
  | ServicesActions
  | ErrorActions;

export type GetState = () => GlobalState;

export type Dispatch = DispatchAPI<Action>;

export type Store = ReduxStore<GlobalState>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
