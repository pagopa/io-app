import {
  isHttpLink,
  isHttpsLink
} from "../../../components/ui/Markdown/handlers/link";
import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { getUrlBasepath } from "../../../utils/url";

/**
 * Track when the app is opened from a Universal App Link. If Mixpanel is not
 * yet initialized, the event will be enqueued and sent once Mixpanel
 * initialization is complete.
 *
 * @param link_id The URL that opened the app
 * @param mixpanelUserOptedIn Whether the user has enabled Mixpanel tracking. If
 *   false or undefined, the event will not be enqueued (but will still be
 *   tracked if Mixpanel is initialized). If true, the tracking will always be
 *   attempted.
 */
export function trackIOOpenedFromUniversalAppLink(
  link_id: string,
  mixpanelUserOptedIn?: boolean | null
) {
  // check if is universal app link (if it is not, it means that it is an
  // deeplink that should not be tracked as universal app link opening)
  if (isHttpsLink(link_id) || isHttpLink(link_id)) {
    const eventProperties = buildEventProperties("TECH", undefined, {
      link_id: getUrlBasepath(link_id)
    });

    if (isMixpanelInstanceInitialized()) {
      // If Mixpanel is initialized, track normally
      // (mixpanelTrack handles opt-in internally)
      void mixpanelTrack("IO_UNIVERSAL_APP_LINK", eventProperties);
    } else {
      if (mixpanelUserOptedIn) {
        // enqueue the event to be sent once Mixpanel opt-in is true
        enqueueMixpanelEvent("IO_UNIVERSAL_APP_LINK", link_id, eventProperties);
      }
      // If mixpanelUserOptedIn is false or null/undefined, we do not enqueue the event to respect the user's choice
    }
  }
}
