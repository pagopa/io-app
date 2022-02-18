import {
  NavigationAction,
  NavigationContainerRef
} from "@react-navigation/native";
import { Route } from "@react-navigation/routers";
import React from "react";
import { instabugLog, TypeLogs } from "../boot/configureInstabug";
import { mixpanelTrack } from "../mixpanel";

export const navigationRef = React.createRef<NavigationContainerRef>();

const withLogging =
  <A extends Array<unknown>, R>(f: (...a: A) => R) =>
  (...args: A): R => {
    if (navigationRef.current === null) {
      instabugLog(
        `call to NavigationService.${f.name} but navigator is ${navigator}`,
        TypeLogs.ERROR,
        "NavigationService"
      );
      void mixpanelTrack("NAVIGATION_SERVICE_NAVIGATOR_UNDEFINED", {
        method: f.name
      });
    }
    return f(...args);
  };

// NavigationContainerComponent
const setTopLevelNavigator = (navigatorRef: any | null | undefined) => {
  // TODO: remove when the bug is confirmed as solved
  instabugLog(
    `Initialize setTopLevelNavigator with argument ${
      navigator !== null && navigator !== undefined
    }`,
    TypeLogs.DEBUG,
    "NavigationService"
  );
  navigator = navigatorRef;
};
// NavigationContainerComponent
const getNavigator = (): React.RefObject<NavigationContainerRef> =>
  navigationRef;

// NavigationParams
const navigate = (routeName: string, params?: any) => {
  navigationRef.current?.navigate(routeName, params);

  // ?.dispatch(NavigationActions.navigate({ routeName, params }));
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigationRef.current?.dispatch(action);
};

const getCurrentRouteName = (): string | undefined =>
  navigationRef.current?.getCurrentRoute()?.name;
// currentRouteState ? utilsGetCurrentRouteName(currentRouteState) : undefined;

const getCurrentRouteKey = (): string | undefined =>
  navigationRef.current?.getCurrentRoute()?.key;
// currentRouteState ? utilsGetCurrentRouteKey(currentRouteState) : undefined;

// NavigationLeafRoute
const getCurrentRoute = (): Route<string> | undefined =>
  navigationRef.current?.getCurrentRoute();
// currentRouteState ? utilsGetCurrentRoute(currentRouteState) : undefined;

const getCurrentState = () => navigationRef?.current?.getState();

// add other navigation functions that you need and export them
export default {
  navigate: withLogging(navigate),
  getNavigator,
  setTopLevelNavigator,
  dispatchNavigationAction: withLogging(dispatchNavigationAction),
  getCurrentRouteName,
  getCurrentRouteKey,
  getCurrentRoute,
  getCurrentState
};
