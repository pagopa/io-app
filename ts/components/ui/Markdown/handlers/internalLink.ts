/**
 * An handler for application internal links
 */
import { CommonActions, NavigationAction } from "@react-navigation/native";
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import URLParse from "url-parse";
import {
  bpdEnabled,
  myPortalEnabled,
  svEnabled,
  uaDonationsEnabled
} from "../../../../config";
import BPD_ROUTES from "../../../../features/bonus/bpd/navigation/routes";
import CGN_ROUTES from "../../../../features/bonus/cgn/navigation/routes";
import SV_ROUTES from "../../../../features/bonus/siciliaVola/navigation/routes";
import UADONATION_ROUTES from "../../../../features/uaDonations/navigation/routes";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { addInternalRouteNavigation } from "../../../../store/actions/internalRouteNavigation";
import { Dispatch } from "../../../../store/actions/types";
import { isTestEnv } from "../../../../utils/environment";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

/**
 * TODO: All the mapping Route -> NavigationAction is a temporary solution to allow backward compatibility during the react-navigation v5 phase.
 * This handling will be integrated in react-navigation in a next iteration.
 * Please, if you add another rule consider that this custom handling will be removed.
 */

// TODO: string should be replaced with a strong type that express all the allowed routes
const routesToNavigationAction: Record<string, NavigationAction> = {
  [ROUTES.MESSAGES_HOME]: CommonActions.navigate(ROUTES.MAIN, {
    screen: ROUTES.MESSAGES_HOME
  }),
  [ROUTES.PROFILE_PREFERENCES_HOME]: CommonActions.navigate(
    ROUTES.PROFILE_NAVIGATOR,
    {
      screen: ROUTES.PROFILE_PREFERENCES_HOME
    }
  ),
  [ROUTES.WALLET_HOME]: CommonActions.navigate(ROUTES.MAIN, {
    screen: ROUTES.WALLET_HOME
  }),
  [ROUTES.SERVICES_HOME]: CommonActions.navigate(ROUTES.MAIN, {
    screen: ROUTES.SERVICES_HOME
  }),
  [ROUTES.PROFILE_MAIN]: CommonActions.navigate(ROUTES.MAIN, {
    screen: ROUTES.PROFILE_MAIN
  }),
  [ROUTES.PROFILE_PRIVACY]: CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
    screen: ROUTES.PROFILE_PRIVACY
  }),
  [ROUTES.PROFILE_PRIVACY_MAIN]: CommonActions.navigate(
    ROUTES.PROFILE_NAVIGATOR,
    {
      screen: ROUTES.PROFILE_PRIVACY_MAIN
    }
  ),
  [ROUTES.PROFILE_PRIVACY_MAIN]: CommonActions.navigate(
    ROUTES.PROFILE_NAVIGATOR,
    {
      screen: ROUTES.PROFILE_PRIVACY_MAIN
    }
  ),
  [ROUTES.PAYMENTS_HISTORY_SCREEN]: CommonActions.navigate(
    ROUTES.WALLET_NAVIGATOR,
    {
      screen: ROUTES.PAYMENTS_HISTORY_SCREEN
    }
  ),
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN]: CommonActions.navigate(
    ROUTES.WALLET_NAVIGATOR,
    {
      screen: ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN
    }
  )
};

const legacyRoutesToNavigationAction: Record<string, NavigationAction> = {
  PREFERENCES_SERVICES: CommonActions.navigate(ROUTES.MAIN, {
    screen: ROUTES.SERVICES_HOME
  }),
  PREFERENCES_HOME: CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
    screen: ROUTES.PROFILE_PREFERENCES_HOME
  })
};

const bpdRoutesToNavigationAction: Record<string, NavigationAction> = {
  [BPD_ROUTES.CTA_BPD_IBAN_EDIT]: CommonActions.navigate(
    ROUTES.WALLET_NAVIGATOR,
    {
      screen: BPD_ROUTES.CTA_BPD_IBAN_EDIT
    }
  )
};

const cgnRoutesToNavigationAction: Record<string, NavigationAction> = {
  [CGN_ROUTES.ACTIVATION.CTA_START_CGN]: CommonActions.navigate(
    CGN_ROUTES.ACTIVATION.MAIN,
    {
      screen: CGN_ROUTES.ACTIVATION.CTA_START_CGN
    }
  ),
  [CGN_ROUTES.DETAILS.DETAILS]: CommonActions.navigate(
    CGN_ROUTES.DETAILS.MAIN,
    {
      screen: CGN_ROUTES.DETAILS.DETAILS
    }
  )
};

const myPortalRoutesToNavigationAction: Record<string, NavigationAction> = {
  [ROUTES.SERVICE_WEBVIEW]: CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
    screen: ROUTES.SERVICE_WEBVIEW
  })
};

const uaDonationsRoutesToNavigationAction: Record<string, NavigationAction> = {
  [UADONATION_ROUTES.WEBVIEW]: CommonActions.navigate(UADONATION_ROUTES.WEBVIEW)
};

const svRoutesToNavigationAction: Record<string, NavigationAction> = {
  [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: CommonActions.navigate(
    ROUTES.SERVICES_NAVIGATOR,
    {
      screen: SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS
    }
  ),
  [SV_ROUTES.VOUCHER_LIST.LIST]: CommonActions.navigate(
    ROUTES.SERVICES_NAVIGATOR,
    {
      screen: SV_ROUTES.VOUCHER_LIST.LIST
    }
  )
};

const allowedRoutes = {
  ...routesToNavigationAction,
  ...cgnRoutesToNavigationAction,
  ...legacyRoutesToNavigationAction,
  ...(myPortalEnabled ? myPortalRoutesToNavigationAction : {}),
  ...(bpdEnabled ? bpdRoutesToNavigationAction : {}),
  ...(svEnabled ? svRoutesToNavigationAction : {}),
  ...(uaDonationsEnabled ? uaDonationsRoutesToNavigationAction : {})
};

export const testableALLOWED_ROUTE_NAMES = isTestEnv
  ? allowedRoutes
  : undefined;

type InternalRouteParams = Record<string, string | undefined>;
export type InternalRoute = {
  routeName: string;
  params?: InternalRouteParams;
  navigationAction: NavigationAction;
};

export function getInternalRoute(href: string): Option<InternalRoute> {
  // NOTE: URL built-in class seems not to be implemented in Android
  try {
    const url = new URLParse(href, true);
    if (url.protocol.toLowerCase() === IO_INTERNAL_LINK_PROTOCOL) {
      return fromNullable(allowedRoutes[url.host.toUpperCase()]).map(
        navigationAction => ({
          routeName: url.host.toUpperCase(),
          params: Object.keys(url.query).length === 0 ? undefined : url.query, // avoid empty object,
          navigationAction
        })
      );
    }
    return none;
  } catch (_) {
    return none;
  }
}

/**
 * try to extract the internal route from href. If it is defined and allowed (white listed)
 * dispatch the navigation params (to store into the store) and dispatch the navigation action
 * @param dispatch
 * @param href
 * @param serviceId
 */
export function handleInternalLink(
  dispatch: Dispatch,
  href: string,
  serviceId?: string
) {
  getInternalRoute(href).map(internalNavigation => {
    dispatch(
      addInternalRouteNavigation({
        ...internalNavigation,
        params: { ...internalNavigation.params, serviceId }
      })
    );
    NavigationService.dispatchNavigationAction(
      internalNavigation.navigationAction
    );
  });
}
