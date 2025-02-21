import { URL } from "react-native-url-polyfill";
import { AppDispatch } from "../../App";
import { utmLinkSetParams } from "./store/actions";

/**
 * Check if the initial URL has a utm_campaign parameter
 * @param url universal/app link with `utm_campaign` and `utm_source` parameters
 * ex: https://continua.io.pagopa.it?utm_campaign=re-engagement&utm_source=mail
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
