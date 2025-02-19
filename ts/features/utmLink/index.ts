import { URL } from "react-native-url-polyfill";
import { AppDispatch } from "../../App";
import { utmLinkSetCampaign } from "./store/actions";

/**
 * Check if the initial URL has a utm_campaign parameter
 * @param url universal/app link with `utm_campaign` parameter
 * ex: https://continua.io.pagopa.it?utm_campaign=re-engagement
 */
export const trackUtmCampaign = (url: string, dispatch: AppDispatch) => {
  const urlParams = new URL(url).searchParams;
  const utmCampaign = urlParams.get("utm_campaign");
  if (utmCampaign) {
    dispatch(utmLinkSetCampaign(utmCampaign));
  }
};
