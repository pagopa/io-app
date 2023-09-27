/**
 * An handler for application internal links
 */
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  bpdEnabled,
  fciEnabled,
  fimsEnabled,
  myPortalEnabled,
  svEnabled,
  uaDonationsEnabled
} from "../config";
import BPD_ROUTES from "../features/bonus/bpd/navigation/routes";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import SV_ROUTES from "../features/bonus/siciliaVola/navigation/routes";
import { FCI_ROUTES } from "../features/fci/navigation/routes";
import FIMS_ROUTES from "../features/fims/navigation/routes";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import ROUTES from "../navigation/routes";
import { isTestEnv } from "./environment";
import {
  IO_FIMS_LINK_PREFIX,
  IO_INTERNAL_LINK_PREFIX,
  IO_INTERNAL_LINK_PROTOCOL,
  IO_UNIVERSAL_LINK_PREFIX
} from "./navigation";
import { extractPathFromURL } from "./url";

/**
 * This handling is used to convert old CTAs and links to current internal linking config
 * of react-navigation ≥ v5.
 *
 * This object should not be edited anymore.
 * To add new routes consider to add a new path only on AppStackNavigator linking config.
 */
// TODO: string should be replaced with a strong type that express all the allowed routes
const routesToNavigationLink: Record<string, string> = {
  [ROUTES.MESSAGES_HOME]: "/main/messages",
  [ROUTES.PROFILE_PREFERENCES_HOME]: "/profile/preferences",
  [ROUTES.WALLET_HOME]: "/main/wallet",
  [ROUTES.SERVICES_HOME]: "/main/services",
  [ROUTES.PROFILE_MAIN]: "/main/profile",
  [ROUTES.PROFILE_PRIVACY]: "/profile/privacy",
  [ROUTES.PROFILE_PRIVACY_MAIN]: "/profile/privacy-main",
  [ROUTES.PAYMENTS_HISTORY_SCREEN]: "/wallet/payments-history",
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN]:
    "/wallet/card-onboarding-attempts"
};

const legacyRoutesToNavigationLink: Record<string, string> = {
  PREFERENCES_SERVICES: "/main/services",
  PREFERENCES_HOME: "/profile/preferences"
};

const bpdRoutesToNavigationLink: Record<string, string> = {
  [BPD_ROUTES.CTA_BPD_IBAN_EDIT]: "/wallet/bpd-iban-update"
};

const cgnRoutesToNavigationLink: Record<string, string> = {
  [CGN_ROUTES.ACTIVATION.CTA_START_CGN]: "/cgn-activation/start",
  [CGN_ROUTES.DETAILS.DETAILS]: "/cgn-details/detail"
};

const myPortalRoutesToNavigationLink: Record<string, string> = {
  [ROUTES.SERVICE_WEBVIEW]: "/services/webview"
};

const uaDonationsRoutesToNavigationLink: Record<string, string> = {
  [UADONATION_ROUTES.WEBVIEW]: "/uadonations-webview"
};

const svRoutesToNavigationLink: Record<string, string> = {
  [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]:
    "/services/sv-generation/check-status",
  [SV_ROUTES.VOUCHER_LIST.LIST]: "/services/sv-vouchers/list"
};

const fimsRoutesToNavigationLink: Record<string, string> = {
  [FIMS_ROUTES.WEBVIEW]: "/fims/webview"
};

const fciRoutesToNavigationLink: Record<string, string> = {
  [FCI_ROUTES.MAIN]: "/fci/main"
};

const allowedRoutes = {
  ...routesToNavigationLink,
  ...cgnRoutesToNavigationLink,
  ...legacyRoutesToNavigationLink,
  ...(myPortalEnabled ? myPortalRoutesToNavigationLink : {}),
  ...(bpdEnabled ? bpdRoutesToNavigationLink : {}),
  ...(svEnabled ? svRoutesToNavigationLink : {}),
  ...(uaDonationsEnabled ? uaDonationsRoutesToNavigationLink : {}),
  ...(fimsEnabled ? fimsRoutesToNavigationLink : {}),
  ...(fciEnabled ? fciRoutesToNavigationLink : {})
};

export const isServiceDetailNavigationLink = (
  internalOrUniversalLink: string
) =>
  pipe(internalOrUniversalLink.toUpperCase(), upperInternalOrUniversalLink =>
    pipe(
      [
        `${IO_INTERNAL_LINK_PROTOCOL}//services/service-detail`,
        `${IO_UNIVERSAL_LINK_PREFIX}/services/service-detail`
      ],
      A.map((allowedInternalOrUniversalLink: string) =>
        allowedInternalOrUniversalLink.toUpperCase()
      ),
      A.some(
        upperAllowedInternalOrUniversalLink =>
          upperInternalOrUniversalLink.indexOf(
            upperAllowedInternalOrUniversalLink
          ) === 0
      )
    )
  );

export const testableALLOWED_ROUTE_NAMES = isTestEnv
  ? allowedRoutes
  : undefined;

/**
 * Extracts the internal route from href. If it is defined and allowed (white listed)
 * returns the internal route, otherwise returns the href
 * @param href
 * @returns
 */
export function getInternalRoute(href: string): string {
  return pipe(
    extractPathFromURL(
      [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX, IO_FIMS_LINK_PREFIX],
      href
    ),
    O.fromNullable,
    O.map(extractedPath => {
      const [path, params] = extractedPath.split("?");

      return pipe(
        allowedRoutes[path.toUpperCase()],
        O.fromNullable,
        O.map(path => path + (params ? "?" + params : "")),
        O.getOrElse(() =>
          extractedPath.startsWith("/") ? extractedPath : "/" + extractedPath
        )
      );
    }),
    O.getOrElse(() => href)
  );
}

/**
 * try to extract the internal route from href. If it is defined and allowed (white listed)
 * dispatch the navigation params (to store into the store) and dispatch the navigation action
 * @param linkTo
 * @param href
 */
export function handleInternalLink(
  linkTo: (path: string) => void,
  href: string
) {
  linkTo(getInternalRoute(href));
}
