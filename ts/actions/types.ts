/**
 * Defines Flow types for the available actions and store related stuff.
 */

import { NavigationAction } from "react-navigation";
import {
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  Store as ReduxStore,
  StoreEnhancer as ReduxStoreEnhancer
} from "redux";

import { GlobalState } from "../reducers/types";
import { ApplicationActions } from "../store/actions/application";
import { APP_STATE_CHANGE_ACTION } from "../store/actions/constants";
import { ErrorActions } from "../store/actions/error";
import { OnboardingActions } from "../store/actions/onboarding";
import { ProfileActions } from "../store/actions/profile";
import { SessionActions } from "../store/actions/session";

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
  | ProfileActions
  | ErrorActions;

/* eslint-disable no-use-before-define */
// We need to disable the eslint rule because of a problem described here
// @https://github.com/babel/babel-eslint/issues/485
export type GetState = () => GlobalState;

export type Dispatch = DispatchAPI<Action, GlobalState>;

export type Store = ReduxStore<GlobalState>;

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>;

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>;

// Props injected by react-redux connect() function
export type ReduxProps = Readonly<{
  dispatch: Dispatch;
}>;
