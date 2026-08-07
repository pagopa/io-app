import * as pot from "@pagopa/ts-commons/lib/pot";
import { URL as PolyfillURL } from "react-native-url-polyfill";
import { ActionType } from "typesafe-actions";

import { startApplicationInitialization } from "../../../../store/actions/application";
import { isStrictSome } from "../../../../utils/pot";
import { FimsFlowStateTags, FimsSSOState } from "../store/reducers";

export const IO_FIMS_LINK_PROTOCOL = "iosso:";
export const IO_FIMS_LINK_PREFIX = IO_FIMS_LINK_PROTOCOL + "//";

export const foldFimsFlowState = <A>(
  flowState: FimsFlowStateTags,
  onConsents: (state: "consents") => A,
  onInAppBrowser: (state: "in-app-browser-loading") => A,
  onAbort: (state: "abort") => A,
  onShouldRestart: (state: "fastLogin_forced_restart") => A,
  onIdle: (state: "idle") => A
) => {
  switch (flowState) {
    case "abort":
      return onAbort(flowState);
    case "fastLogin_forced_restart":
      return onShouldRestart(flowState);
    case "idle":
      return onIdle(flowState);
    case "in-app-browser-loading":
      return onInAppBrowser(flowState);
  }
  return onConsents(flowState);
};

export const foldFimsFlowStateK =
  <A>(
    onConsents: (state: "consents") => A,
    onInAppBrowser: (state: "in-app-browser-loading") => A,
    onAbort: (state: "abort") => A,
    onShouldRestart: (state: "fastLogin_forced_restart") => A,
    onIdle: (state: "idle") => A
  ) =>
  (flowState: FimsFlowStateTags) =>
    foldFimsFlowState(
      flowState,
      onConsents,
      onInAppBrowser,
      onAbort,
      onShouldRestart,
      onIdle
    );

export const shouldRestartFimsAuthAfterFastLoginFailure = (
  state: FimsSSOState,
  action: ActionType<typeof startApplicationInitialization>
) => {
  const fastLoginSessionExpired = !!(
    action.payload && action.payload.handleSessionExpiration
  );
  if (fastLoginSessionExpired) {
    const hasExpiredDuringConsentsRetrieval = pot.isLoading(state.ssoData);
    const hasExpiredWhileRetrievingServiceData =
      state.currentFlowState === "consents" && isStrictSome(state.ssoData);
    const hasExpiredDuringInAppBrowserRedirectUriRetrieval =
      state.currentFlowState === "in-app-browser-loading";
    return (
      hasExpiredDuringConsentsRetrieval ||
      hasExpiredWhileRetrievingServiceData ||
      hasExpiredDuringInAppBrowserRedirectUriRetrieval
    );
  }
  return false;
};

export const removeFIMSPrefixFromUrl = (fimsUrlWithProtocol: string) => {
  // eslint-disable-next-line no-useless-escape
  const regexp = new RegExp(`^${IO_FIMS_LINK_PROTOCOL}\/\/`, "i");
  return fimsUrlWithProtocol.replace(regexp, "");
};

export const isFIMSLink = (href: string): boolean =>
  href.toLowerCase().startsWith(IO_FIMS_LINK_PREFIX);

const normalizeUrl = (rawUrl: string): string => {
  try {
    const url = new PolyfillURL(rawUrl);
    return `${url.origin}${url.pathname}`.toLowerCase().replace(/\/$/, "");
  } catch {
    return rawUrl.trim().toLowerCase().replace(/\/$/, "");
  }
};

/**
 * Adds the Mixpanel device ID only when the redirect destination is explicitly
 * allowed by remote configuration. Query parameters and fragments do not take
 * part in the allowlist comparison.
 */
export const enrichFimsDestinationUrl = (
  destinationUrl: string,
  trackingEnrichedUrls: ReadonlyArray<string>,
  mixpanelDeviceId: string
): string => {
  try {
    const parsedDestinationUrl = new PolyfillURL(destinationUrl);
    const normalizedDestinationUrl = normalizeUrl(destinationUrl);
    const isAllowedDestination = trackingEnrichedUrls.some(
      allowedUrl => normalizeUrl(allowedUrl) === normalizedDestinationUrl
    );
    if (!isAllowedDestination) {
      return destinationUrl;
    }
    parsedDestinationUrl.searchParams.set("mixpanelId", mixpanelDeviceId);
    return parsedDestinationUrl.toString();
  } catch {
    return destinationUrl;
  }
};
