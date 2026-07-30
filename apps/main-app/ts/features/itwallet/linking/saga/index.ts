import { getActionFromState, getStateFromPath } from "@react-navigation/native";
import { call } from "typed-redux-saga/macro";

import type { ItwDeepLink } from "../utils";

import NavigationService from "../../../../navigation/NavigationService";
import { itwLinkingConfig } from "../../navigation/useItwLinkingOptions";

/**
 * Converts a parsed ITW deep link into a navigation action and dispatches it.
 * The caller owns navigator readiness and stored-link clearing.
 */
export function* handleItwStoredDeepLink(deepLink: ItwDeepLink) {
  const itwState = getStateFromPath(deepLink.path, itwLinkingConfig);
  const itwAction =
    itwState === undefined
      ? undefined
      : getActionFromState(itwState, itwLinkingConfig);

  if (itwAction === undefined) {
    return false;
  }

  yield* call(NavigationService.dispatchNavigationAction, itwAction);

  return true;
}
