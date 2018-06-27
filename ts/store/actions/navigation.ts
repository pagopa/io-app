import { NavigationAction, NavigationState } from "react-navigation";

import { NAVIGATION_RESTORE } from "./constants";

// Actions

export type NavigationRestore = Readonly<{
  type: typeof NAVIGATION_RESTORE;
  payload: NavigationState;
}>;

export type NavigationActions = NavigationAction | NavigationRestore;

// Creators

export const navigationRestore = (navigationState: NavigationState) => ({
  type: NAVIGATION_RESTORE,
  payload: navigationState
});
