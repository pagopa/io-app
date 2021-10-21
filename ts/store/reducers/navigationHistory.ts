/**
 * A reducer to handle the navigation history
 */

import { NavigationState } from "react-navigation";

export type NavigationHistoryState = ReadonlyArray<NavigationState>;

// Selectors

// A selector to read the current route name and check if it is the main one
// export const isOnboardingCompletedSelector = (state: GlobalState) =>
//   state.nav.routes.length > 0 && state.nav.routes[0].routeName === ROUTES.MAIN;
//
// export const navSelector = (state: GlobalState) => state.nav;
//
// export const navHistorySelector = (state: GlobalState) =>
//   state.navigationHistory;
