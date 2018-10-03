/**
 * Action types and action creator related to the deep link handling.
 */

import { NavigationNavigateActionPayload } from "react-navigation";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

/**
 * Saves the deep link to navigate to.
 *
 * When immediate is true, the app will immediately navigate to the route.
 */
export const setDeepLink = createAction(
  "SET_DEEPLINK",
  resolve => (
    navigationPayload: NavigationNavigateActionPayload,
    immediate: boolean = false
  ) => resolve({ navigationPayload, immediate })
);

export const clearDeepLink = createStandardAction("CLEAR_DEEPLINK")();

export const navigateToDeepLink = createAction(
  "NAVIGATE_TO_DEEPLINK",
  resolve => (
    navigationPayload: NavigationNavigateActionPayload,
    prevRouteKey?: string
  ) => resolve({ ...navigationPayload, key: prevRouteKey })
);

export type DeepLinkActions = ActionType<
  typeof setDeepLink | typeof clearDeepLink | typeof navigateToDeepLink
>;
