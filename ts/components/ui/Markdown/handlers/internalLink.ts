/**
 * An handler for application internal links
 */
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import URLParse from "url-parse";
import { bonusVacanzeEnabled, myPortalEnabled } from "../../../../config";
import BONUSVACANZE_ROUTES from "../../../../features/bonusVacanze/navigation/routes";
import ROUTES from "../../../../navigation/routes";
import { Dispatch } from "../../../../store/actions/types";
import { isTestEnv } from "../../../../utils/environment";
import { addInternalRouteNavigation } from "../../../../store/actions/internalRouteNavigation";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

const ROUTE_NAMES: ReadonlyArray<string> = [
  ROUTES.MESSAGES_HOME,
  ROUTES.PROFILE_PREFERENCES_HOME,
  ROUTES.SERVICES_HOME,
  ROUTES.PROFILE_MAIN,
  ROUTES.PROFILE_PRIVACY,
  ROUTES.PROFILE_PRIVACY_MAIN,
  ROUTES.WALLET_HOME,
  ROUTES.WALLET_LIST,
  ROUTES.PAYMENTS_HISTORY_SCREEN
];

const BONUS_VACANZE_ROUTE_NAMES: ReadonlyArray<string> = [
  BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST,
  BONUSVACANZE_ROUTES.BONUS_CTA_ELIGILITY_START
];

const MY_PORTAL_ROUTES: ReadonlyArray<string> = [ROUTES.SERVICE_WEBVIEW];

const ALLOWED_ROUTE_NAMES = ROUTE_NAMES.concat(
  bonusVacanzeEnabled ? BONUS_VACANZE_ROUTE_NAMES : [],
  myPortalEnabled ? MY_PORTAL_ROUTES : []
);

export const testableALLOWED_ROUTE_NAMES = isTestEnv
  ? ALLOWED_ROUTE_NAMES
  : undefined;

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

type InternalRouteParams = Record<string, string | undefined>;
export type InternalRoute = {
  routeName: string;
  params?: InternalRouteParams;
};

export function getInternalRoute(href: string): Option<InternalRoute> {
  // NOTE: URL built-in class seems not to be implemented in Android
  try {
    const url = new URLParse(href, true);
    if (url.protocol.toLowerCase() === IO_INTERNAL_LINK_PROTOCOL) {
      return fromNullable(
        ALLOWED_ROUTE_NAMES.find(
          e => e === replaceOldRoute(url.host.toUpperCase())
        )
      ).map(routeName => ({
        routeName,
        params: Object.keys(url.query).length === 0 ? undefined : url.query // avoid empty object
      }));
    }
    return none;
  } catch (_) {
    return none;
  }
}

export function handleInternalLink(dispatch: Dispatch, href: string) {
  getInternalRoute(href).map(internalNavigation => {
    dispatch(addInternalRouteNavigation(internalNavigation));
    dispatch(
      NavigationActions.navigate({
        routeName: internalNavigation.routeName
      })
    );
  });
}
