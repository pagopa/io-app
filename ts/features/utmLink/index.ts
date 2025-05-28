import { URL } from "react-native-url-polyfill";
import { AppDispatch } from "../../App";
import { utmLinkSetParams } from "./store/actions";

/**
 * This function is used to process the UTM tags from a link.
 * We only process three UTM tags: source, medium and campaign.
 * Only the source and medium tags are mandatory. Without them, the event is not tracked.
 *
 * Example:
 * - https://continua.io.pagopa.it?utm_source=pagopa&utm_medium=email&utm_campaign=re-engagement
 * - https://continua.io.pagopa.it?utm_source=pagopa&utm_medium=email
 *
 * @param url universal/app link with `utm_source` (mandatory), `utm_medium` (mandatory) and `utm_campaign` (optional) parameters
 */
export const processUtmLink = (url: string, dispatch: AppDispatch) => {
  const urlParams = new URL(url).searchParams;
  const utmCampaign = urlParams.get("utm_campaign") || undefined;
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  if (utmSource && utmMedium) {
    dispatch(utmLinkSetParams({ utmSource, utmMedium, utmCampaign }));
  }
};
