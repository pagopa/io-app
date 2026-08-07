import { getActionFromState, getStateFromPath } from "@react-navigation/native";
import { call } from "typed-redux-saga/macro";

import type { ItwDeepLink } from "../utils/linking";

import NavigationService from "../../../../navigation/NavigationService";
import { itwLinkingConfig } from "../../navigation/linking";

/**
 * Converts a parsed ITW deep link into a navigation action and dispatches it.
 * The caller owns navigator readiness and stored-link clearing.
 */
export function* handleItwStoredDeepLink(deepLink: ItwDeepLink) {
  const state = getStateFromPath(deepLink.path, itwLinkingConfig);
  const action =
    state === undefined
      ? undefined
      : getActionFromState(state, itwLinkingConfig);

  if (action === undefined) {
    return false;
  }

  yield* call(NavigationService.dispatchNavigationAction, action);
  return true;
}
