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
}>;

export const setDeepLink = (
  navigationPayload: NavigationNavigateActionPayload
): SetDeepLink => ({
  type: SET_DEEPLINK,
  payload: navigationPayload
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
