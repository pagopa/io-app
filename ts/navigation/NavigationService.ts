import {
  NavigationAction,
  NavigationActions,
  NavigationContainerComponent,
  NavigationLeafRoute,
  NavigationParams,
  NavigationState
} from "react-navigation";
import {
  getCurrentRouteName as deprecatedGetCurrentRouteName,
  getCurrentRouteKey as deprecatedGetCurrentRouteKey,
  getCurrentRoute as utilsGetCurrentRoute
} from "../utils/navigation";

// eslint-disable-next-line functional/no-let
let navigator: NavigationContainerComponent | null;
// eslint-disable-next-line functional/no-let
let currentRouteState: NavigationState | null;

const setTopLevelNavigator = (
  navigatorRef: NavigationContainerComponent | null
) => {
  navigator = navigatorRef;
};

const setCurrentState = (state: NavigationState) => {
  currentRouteState = state;
};

const navigate = (routeName: string, params?: NavigationParams) => {
  navigator?.dispatch(NavigationActions.navigate({ routeName, params }));
};

const dispatchNavigationAction = (action: NavigationAction) => {
  navigator?.dispatch(action);
};

const getCurrentRouteName = (): string | undefined =>
  currentRouteState
    ? deprecatedGetCurrentRouteName(currentRouteState)
    : undefined;

const getCurrentRouteKey = (): string | undefined =>
  currentRouteState
    ? deprecatedGetCurrentRouteKey(currentRouteState)
    : undefined;

const getCurrentRoute = (): NavigationLeafRoute | undefined =>
  currentRouteState ? utilsGetCurrentRoute(currentRouteState) : undefined;

const getCurrentState = (): NavigationState | null => currentRouteState;

// add other navigation functions that you need and export them
export default {
  navigate,
  setTopLevelNavigator,
  dispatchNavigationAction,
  setCurrentState,
  getCurrentRouteName,
  getCurrentRouteKey,
  getCurrentRoute,
  getCurrentState
};
