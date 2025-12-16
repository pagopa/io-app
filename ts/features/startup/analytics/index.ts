import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

const getErrorFlow = (afterIdentificationWithIdp: boolean) =>
  afterIdentificationWithIdp ? "login" : "access";
export const trackGetProfileEndpointTransientErrorScreen = (
  afterIdentificationWithIdp: boolean
) => {
  mixpanelTrack(
    "GET_PROFILE_ERROR_SCREEN",
    buildEventProperties("KO", undefined, {
      error_flow: getErrorFlow(afterIdentificationWithIdp)
    })
  );
};

export const trackGetSessionEndpointTransientErrorScreen = (
  afterIdentificationWithIdp: boolean
) => {
  mixpanelTrack(
    "GET_SESSION_ERROR_SCREEN",
    buildEventProperties("KO", undefined, {
      error_flow: getErrorFlow(afterIdentificationWithIdp)
    })
  );
};

export const trackGetProfileEndpointTransientError = () => {
  mixpanelTrack("GET_PROFILE_ERROR", buildEventProperties("TECH", undefined));
};

export const trackGetSessionEndpointTransientError = () => {
  mixpanelTrack("GET_SESSION_ERROR", buildEventProperties("TECH", undefined));
};
