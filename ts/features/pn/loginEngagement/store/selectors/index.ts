import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { isPnRemoteEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnServiceEnabled } from "../../../reminderBanner/reducer/bannerDismiss";

export const hasSendEngagementScreenBeenDismissedSelector = (
  state: GlobalState
) => state.features.pn.loginEngagement.hasSendEngagementScreenBeenDismissed;

/**
 * A selector that determines whether to display the SEND
 * engagement screen upon app open.
 * This screen is intended for users who have not yet enabled the SEND service.
 *
 * It will be shown only if:
 * - The PN feature is enabled via remote configuration.
 * - The user has not yet enabled the PN service (i.e., the PN inbox is not active).
 * - The user has not previously dismissed this specific engagement screen.
 *
 * @returns {boolean} `true` if the engagement screen should be displayed, `false` otherwise.
 */
export const shouldDisplaySendEngagmentOnFirstAppOpenSelector = createSelector(
  isPnRemoteEnabledSelector,
  isPnServiceEnabled,
  hasSendEngagementScreenBeenDismissedSelector,
  (isPnRemoteEnabled, isPnInboxEnabled, hasSendEngagementScreenBeenDismissed) =>
    isPnRemoteEnabled &&
    !isPnInboxEnabled &&
    !hasSendEngagementScreenBeenDismissed
);
