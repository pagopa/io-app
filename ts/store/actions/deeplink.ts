/**
 * Action types and action creator related to the deeplink handling.
 */

import { NavigationNavigateActionPayload } from "react-navigation";
import {
  CLEAR_DEEPLINK,
  NAVIGATE_TO_DEEPLINK,
  SET_DEEPLINK
} from "./constants";

export type SetDeeplink = Readonly<{
  type: typeof SET_DEEPLINK;
  payload: NavigationNavigateActionPayload;
}>;

export const setDeeplink = (
  navigationPayload: NavigationNavigateActionPayload
): SetDeeplink => ({
  type: SET_DEEPLINK,
  payload: navigationPayload
});

export type ClearDeeplink = Readonly<{
  type: typeof CLEAR_DEEPLINK;
}>;

export const clearDeeplink = (): ClearDeeplink => ({
  type: CLEAR_DEEPLINK
});

export type NavigateToDeeplink = Readonly<{
  type: typeof NAVIGATE_TO_DEEPLINK;
  payload: NavigationNavigateActionPayload;
}>;

export const navigateToDeeplink = (
  navigationPayload: NavigationNavigateActionPayload
): NavigateToDeeplink => ({
  type: NAVIGATE_TO_DEEPLINK,
  payload: navigationPayload
});

export type DeeplinkActions = SetDeeplink | ClearDeeplink;
