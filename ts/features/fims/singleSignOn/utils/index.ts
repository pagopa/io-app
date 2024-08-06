import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType } from "typesafe-actions";
import { FimsFlowStateTags, FimsSSOState } from "../store/reducers";
import { startApplicationInitialization } from "../../../../store/actions/application";

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
  const isConsentsLoading = pot.isLoading(state.consentsData);
  const isIabLoading = state.currentFlowState === "in-app-browser-loading";
  const fastLoginSessionExpired = !!(
    action.payload && action.payload.handleSessionExpiration
  );
  const isInLoadingState = isConsentsLoading || isIabLoading;
  return fastLoginSessionExpired && isInLoadingState;
};
