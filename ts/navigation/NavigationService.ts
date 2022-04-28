import {
  NavigationAction,
  NavigationContainerRef
} from "@react-navigation/native";
import { Route } from "@react-navigation/routers";
import React from "react";
import { mixpanelTrack } from "../mixpanel";

export const navigationRef = React.createRef<NavigationContainerRef>();
// eslint-disable-next-line functional/no-let
let isNavigationReady: boolean = false;

export const setNavigationReady = () => {
  // eslint-disable-next-line functional/immutable-data
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
const getNavigator = (): React.RefObject<NavigationContainerRef> =>
  navigationRef;

// NavigationParams
const navigate = (routeName: string, params?: any) => {
  if (isNavigationReady) {
    navigationRef.current?.navigate(routeName, params);
  }
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigationRef.current?.dispatch(action);
};

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
  setNavigationReady
};
