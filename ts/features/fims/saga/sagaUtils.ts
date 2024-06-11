import { URL as PolyfillURL } from "react-native-url-polyfill";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export const buildAbsoluteUrl = (
  redirect: string,
  originalRequestUrl: string
) => {
  try {
    const redirectUrl = new PolyfillURL(redirect);
    return redirectUrl.href;
  } catch (error) {
    try {
      const originalUrl = new PolyfillURL(originalRequestUrl);
      const origin = originalUrl.origin;
      const composedUrlString = redirect.startsWith("/")
        ? `${origin}${redirect}`
        : `${origin}/${redirect}`;
      const composedUrl = new PolyfillURL(composedUrlString);
      return composedUrl.href;
    } catch {
      return undefined;
    }
  }
};

export const logToMixPanel = (toLog: string) => {
  void mixpanelTrack(
    "FIMS_TECH_TEMP_ERROR",
    buildEventProperties("TECH", undefined, { message: toLog })
  );
};
