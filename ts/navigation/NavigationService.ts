import {
  NavigationAction,
  NavigationActions,
  NavigationContainerComponent,
  NavigationLeafRoute,
  NavigationParams,
  NavigationState
} from "react-navigation";
import { instabugLog, TypeLogs } from "../boot/configureInstabug";
import { mixpanelTrack } from "../mixpanel";
import {
  getCurrentRoute as utilsGetCurrentRoute,
  getCurrentRouteKey as utilsGetCurrentRouteKey,
  getCurrentRouteName as utilsGetCurrentRouteName
} from "../utils/navigation";

// eslint-disable-next-line functional/no-let
let navigator: NavigationContainerComponent | null | undefined;
// eslint-disable-next-line functional/no-let
let currentRouteState: NavigationState | null = null;

const withLogging =
  <A extends Array<unknown>, R>(f: (...a: A) => R) =>
  (...args: A): R => {
    if (navigator === null || navigator === undefined) {
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

const setTopLevelNavigator = (
  navigatorRef: NavigationContainerComponent | null | undefined
) => {
  navigator = navigatorRef;
};

const getNavigator = (): NavigationContainerComponent | null | undefined =>
  navigator;

const setCurrentState = (state: NavigationState) => {
  // This is a security check since sometime the onNavigationStateChange could return an undefined state ignoring the type
  currentRouteState = state ?? null;
};

const navigate = (routeName: string, params?: NavigationParams) => {
  navigator?.dispatch(NavigationActions.navigate({ routeName, params }));
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigator?.dispatch(action);
};

const getCurrentRouteName = (): string | undefined =>
  currentRouteState ? utilsGetCurrentRouteName(currentRouteState) : undefined;

const getCurrentRouteKey = (): string | undefined =>
  currentRouteState ? utilsGetCurrentRouteKey(currentRouteState) : undefined;

const getCurrentRoute = (): NavigationLeafRoute | undefined =>
  currentRouteState ? utilsGetCurrentRoute(currentRouteState) : undefined;

const getCurrentState = (): NavigationState | null => currentRouteState;

// add other navigation functions that you need and export them
export default {
  navigate: withLogging(navigate),
  getNavigator,
  setTopLevelNavigator,
  dispatchNavigationAction: withLogging(dispatchNavigationAction),
  setCurrentState,
  getCurrentRouteName,
  getCurrentRouteKey,
  getCurrentRoute,
  getCurrentState
};
