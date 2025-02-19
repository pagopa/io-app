import { URL } from "react-native-url-polyfill";

/**
 * Check if the initial URL has a utm_campaign parameter
 * @param url universal/app link with `utm_campaign` parameter
 * ex: https://continua.io.pagopa.it?utm_campaign=re-engagement
 */
export const trackUtmCampaign = (url: string) => {
  console.log("🔥 Initial URL", url);
  const urlParams = new URL(url).searchParams;
  const utmCampaign = urlParams.get("utm_campaign");
  if (utmCampaign) {
    // TODO: dispatch an action to store the utm_campaign value
    console.log("utm_campaign", utmCampaign);
  }
};
