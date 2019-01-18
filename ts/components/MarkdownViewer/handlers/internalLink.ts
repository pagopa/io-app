/**
 * An handler for application internal links
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";

import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";

// Prefix to match uri like `ioit://PROFILE_MAIN`
const INTERNAL_TARGET_PREFIX = "ioit://";

const ALLOWED_ROUTE_NAMES: ReadonlyArray<string> = [
  ROUTES.MESSAGE_LIST,
  ROUTES.PREFERENCES_HOME,
  ROUTES.PREFERENCES_SERVICES,
  ROUTES.PROFILE_MAIN,
  ROUTES.PROFILE_PRIVACY,
  ROUTES.PROFILE_PRIVACY_MAIN,
  ROUTES.WALLET_HOME,
  ROUTES.WALLET_LIST
];

function getInternalRoute(href: string): Option<string> {
  const parsed = href.split(INTERNAL_TARGET_PREFIX);

  if (parsed.length === 2 && parsed[0] === "") {
    const routeName = parsed[1];

    // Return if available the react-navigation route
    if (ALLOWED_ROUTE_NAMES.indexOf(routeName.toUpperCase()) > -1) {
      return some(routeName);
    }
  }

  return none;
}

export function handleInternalLink(dispatch: Dispatch, href: string) {
  const maybeInternalRoute = getInternalRoute(href);

  if (maybeInternalRoute.isSome()) {
    const internalRoute = maybeInternalRoute.value;
    dispatch(
      NavigationActions.navigate({
        routeName: internalRoute
      })
    );
  }
}
