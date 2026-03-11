import {
  NavigationAction,
  NavigationContainerRef
} from "@react-navigation/native";
import { Route } from "@react-navigation/routers";

import { createRef, RefObject } from "react";
import { mixpanelTrack } from "../mixpanel";
import { AppParamsList } from "./params/AppParamsList";

export const navigationRef = createRef<NavigationContainerRef<AppParamsList>>();
// eslint-disable-next-line functional/no-let
let isNavigationReady: boolean = false;

// eslint-disable-next-line functional/no-let
let isMainNavigatorReady = false;

export const setMainNavigatorReady = (isReady?: boolean) => {
  isMainNavigatorReady = isReady ?? true;
};

export const setNavigationReady = () => {
  isNavigationReady = true;
};

export const getIsNavigationReady = () =>
  isNavigationReady && navigationRef.current !== null;

const withLogging =
  <A extends Array<unknown>, R>(f: (...a: A) => R) =>
  (...args: A): R => {
    if (navigationRef.current === null || !isNavigationReady) {
      void mixpanelTrack("NAVIGATION_SERVICE_NAVIGATOR_UNDEFINED", {
        method: f.name
      });
    }
    return f(...args);
  };

// NavigationContainerComponent
const getNavigator =
  (): RefObject<NavigationContainerRef<AppParamsList> | null> => navigationRef;

// NavigationParams
// This definition comes from react-navigation navigate definition.
export type NavigationParams<T extends keyof AppParamsList> = T extends unknown
  ? // This condition checks if the params are optional,
    // which means it's either undefined or a union with undefined
    undefined extends AppParamsList[T]
    ?
        | [screen: T] // if the params are optional, we don't have to provide it
        | [screen: T, params: AppParamsList[T]]
    : [screen: T, params: AppParamsList[T]]
  : never;

const navigate = <T extends keyof AppParamsList>(
  ...args: NavigationParams<T>
) => {
  if (isNavigationReady) {
    navigationRef.current?.navigate(...args);
  }
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigationRef.current?.dispatch(action);
};

const getIsMainNavigatorReady = () => isMainNavigatorReady;

const getCurrentRouteName = (): string | undefined =>
  navigationRef.current?.getCurrentRoute()?.name;

const getCurrentRouteKey = (): string | undefined =>
  navigationRef.current?.getCurrentRoute()?.key;

// NavigationLeafRoute
const getCurrentRoute = (): Route<string> | undefined =>
  navigationRef.current?.getCurrentRoute();

const getCurrentState = () => navigationRef?.current?.getState();

// add other navigation functions that you need and export them
export default {
  navigate: withLogging(navigate),
  getNavigator,
  dispatchNavigationAction: withLogging(dispatchNavigationAction),
  getCurrentRouteName,
  getCurrentRouteKey,
  getCurrentRoute,
  getCurrentState,
  getIsNavigationReady,
  setNavigationReady,
  getIsMainNavigatorReady
};
