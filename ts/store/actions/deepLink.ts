/**
 * Action types and action creator related to the deep link handling.
 */

import { NavigationNavigateActionPayload } from "react-navigation";
import {
  CLEAR_DEEPLINK,
  NAVIGATE_TO_DEEPLINK,
  SET_DEEPLINK
} from "./constants";

export type SetDeepLink = Readonly<{
  type: typeof SET_DEEPLINK;
  payload: NavigationNavigateActionPayload;
  immediate: boolean;
}>;

/**
 * Saves the deep link to navigate to.
 *
 * When immediate is true, the app will immediately navigate to the route.
 */
export const setDeepLink = (
  navigationPayload: NavigationNavigateActionPayload,
  immediate: boolean = false
): SetDeepLink => ({
  type: SET_DEEPLINK,
  payload: navigationPayload,
  immediate
});

export type ClearDeepLink = Readonly<{
  type: typeof CLEAR_DEEPLINK;
}>;

export const clearDeepLink = (): ClearDeepLink => ({
  type: CLEAR_DEEPLINK
});

export type NavigateToDeepLink = Readonly<{
  type: typeof NAVIGATE_TO_DEEPLINK;
  payload: NavigationNavigateActionPayload;
}>;

export const navigateToDeepLink = (
  navigationPayload: NavigationNavigateActionPayload
): NavigateToDeepLink => ({
  type: NAVIGATE_TO_DEEPLINK,
  payload: navigationPayload
});

export type DeepLinkActions = SetDeepLink | ClearDeepLink;
