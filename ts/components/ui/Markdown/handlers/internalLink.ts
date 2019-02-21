/**
 * An handler for application internal links
 */
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";

import ROUTES from "../../../../navigation/routes";
import { Dispatch } from "../../../../store/actions/types";

// Prefix to match uri like `ioit://PROFILE_MAIN`
const INTERNAL_TARGET_PREFIX = "ioit://";

const ALLOWED_ROUTE_NAMES: ReadonlyArray<string> = [
  ROUTES.MESSAGES_HOME,
  ROUTES.PREFERENCES_HOME,
  ROUTES.PREFERENCES_SERVICES,
  ROUTES.PROFILE_MAIN,
  ROUTES.PROFILE_PRIVACY,
  ROUTES.PROFILE_PRIVACY_MAIN,
  ROUTES.WALLET_HOME,
  ROUTES.WALLET_LIST
];

function getInternalRoute(href: string): Option<string> {
  return some(href.split(INTERNAL_TARGET_PREFIX))
    .filter(_ => _.length === 2 && _[0] === "")
    .chain(_ =>
      fromNullable(ALLOWED_ROUTE_NAMES.find(e => e === _[1].toUpperCase()))
    );
}

export function handleInternalLink(dispatch: Dispatch, href: string) {
  getInternalRoute(href).map(routeName =>
    dispatch(
      NavigationActions.navigate({
        routeName
      })
    )
  );
}
