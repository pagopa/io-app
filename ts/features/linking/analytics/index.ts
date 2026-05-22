import {
  isHttpLink,
  isHttpsLink
} from "../../../components/ui/Markdown/handlers/link";
import {
  mixpanelTrack,
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized
} from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { getUrlBasepath } from "../../../utils/url";

/**
 * Track when the app is opened from a Universal App Link.
 * If Mixpanel is not yet initialized, the event will be enqueued and sent
 * once Mixpanel initialization is complete.
 *
 * @param link_id The URL that opened the app
 * @param isMixpanelEnabled Whether the user has enabled Mixpanel tracking.
 *                          If false, the event will not be enqueued (but will still be tracked if Mixpanel is initialized).
 *                          If true or undefined, the tracking will always be attempted.
 */
export function trackIOOpenedFromUniversalAppLink(
  link_id: string,
  isMixpanelEnabled?: boolean | null
) {
  // check if is universal app link (if it is not, it means that it is an
  // deeplink that should not be tracked as universal app link opening)
  if (isHttpsLink(link_id) || isHttpLink(link_id)) {
    const eventProperties = buildEventProperties("TECH", undefined, {
      link_id: getUrlBasepath(link_id)
    });

    if (isMixpanelInstanceInitialized()) {
      // If Mixpanel is initialized, track normally
      // (mixpanelTrack handles opt-out internally)
      void mixpanelTrack("IO_UNIVERSAL_APP_LINK", eventProperties);
    } else if (isMixpanelEnabled !== false) {
      // If Mixpanel is not initialized and user hasn't explicitly disabled tracking,
      // enqueue the event to be sent once Mixpanel is initialized
      enqueueMixpanelEvent("IO_UNIVERSAL_APP_LINK", link_id, eventProperties);
    }
    // If isMixpanelEnabled is false and Mixpanel is not initialized,
    // we skip enqueueing to respect user's choice
  }
}
