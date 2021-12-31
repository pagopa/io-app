import {
  NavigationAction,
  NavigationActions,
  NavigationContainerComponent,
  NavigationLeafRoute,
  NavigationParams,
  NavigationState
} from "react-navigation";
import {
  getCurrentRoute as utilsGetCurrentRoute,
  getCurrentRouteKey as utilsGetCurrentRouteKey,
  getCurrentRouteName as utilsGetCurrentRouteName
} from "../utils/navigation";

// eslint-disable-next-line functional/no-let
let navigator: NavigationContainerComponent | null;
// eslint-disable-next-line functional/no-let
let currentRouteState: NavigationState | null = null;

const setTopLevelNavigator = (
  navigatorRef: NavigationContainerComponent | null
) => {
  navigator = navigatorRef;
};

const setCurrentState = (state: NavigationState) => {
  // This is a security check since sometime the onNavigationStateChange could return an empty state ignoring the type
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
  navigate,
  setTopLevelNavigator,
  dispatchNavigationAction,
  setCurrentState,
  getCurrentRouteName,
  getCurrentRouteKey,
  getCurrentRoute,
  getCurrentState
};
