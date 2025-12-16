import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

/**
 * This function is used to track the tap on a link with UTM tags.
 * We only process three UTM tags: source, medium and campaign.
 * Only the source and medium tags are mandatory. Without them, the event is not tracked.
 *
 * Example:
 * - https://continua.io.pagopa.it?utm_source=pagopa&utm_medium=email&utm_campaign=re-engagement
 * - https://continua.io.pagopa.it?utm_source=pagopa&utm_medium=email
 *
 * @param utm_source UTM source tag (mandatory)
 * @param utm_medium  UTM medium tag (mandatory)
 * @param utm_campaign UTM campaign tag (optional)
 *
 */
export function trackUtmLink(
  utm_source: string,
  utm_medium: string,
  utm_campaign?: string
) {
  void mixpanelTrack(
    "UTM_LINK",
    buildEventProperties("UX", undefined, {
      utm_source,
      utm_medium,
      utm_campaign
    })
  );
}
