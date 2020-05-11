/**
 * An handler for application internal links
 */
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";

import ROUTES from "../../../../navigation/routes";
import { Dispatch } from "../../../../store/actions/types";

// Prefix to match uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PREFIX = "ioit://";

const ALLOWED_ROUTE_NAMES: ReadonlyArray<string> = [
  ROUTES.MESSAGES_HOME,
  ROUTES.PROFILE_PREFERENCES_HOME,
  ROUTES.SERVICES_HOME,
  ROUTES.PROFILE_MAIN,
  ROUTES.PROFILE_PRIVACY,
  ROUTES.PROFILE_PRIVACY_MAIN,
  ROUTES.WALLET_HOME,
  ROUTES.WALLET_LIST,
  ROUTES.PAYMENTS_HISTORY_SCREEN,
  ROUTES.PAYMENT_SCAN_QR_CODE
];

/**
 * Used to replace old navigation routes with new one
 */
function replaceOldRoute(routeName: string): string {
  switch (routeName) {
    case "PREFERENCES_SERVICES":
      return ROUTES.SERVICES_HOME;

    case "PREFERENCES_HOME":
      return ROUTES.PROFILE_PREFERENCES_HOME;

    default:
      return routeName;
  }
}

function getInternalRoute(href: string): Option<string> {
  return some(href.split(IO_INTERNAL_LINK_PREFIX))
    .filter(_ => _.length === 2 && _[0] === "")
    .chain(_ =>
      fromNullable(
        ALLOWED_ROUTE_NAMES.find(e => e === replaceOldRoute(_[1].toUpperCase()))
      )
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
