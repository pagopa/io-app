import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType } from "typesafe-actions";
import { FimsFlowStateTags, FimsSSOState } from "../store/reducers";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { isStrictSome } from "../../../../utils/pot";

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
    case "in-app-browser-loading":
      return onInAppBrowser(flowState);
    case "fastLogin_forced_restart":
      return onShouldRestart(flowState);
    case "idle":
      return onIdle(flowState);
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
