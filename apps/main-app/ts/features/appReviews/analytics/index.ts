import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export const trackAppReviewRequestAttempt = () =>
  void mixpanelTrack(
    "APP_REVIEW_REQUEST_ATTEMPT",
    buildEventProperties("TECH", undefined)
  );

export const trackAppReviewRequestFailure = () =>
  void mixpanelTrack(
    "APP_REVIEW_REQUEST_FAILED",
    buildEventProperties("TECH", undefined)
  );
