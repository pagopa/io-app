import { getType } from "typesafe-actions";

import { mixpanelTrack } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import CGN_ROUTES from "../navigation/routes";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure,
  cgnActivationStart,
  cgnActivationStatus,
  cgnRequestActivation
} from "../store/actions/activation";
import { cgnCodeFromBucket } from "../store/actions/bucket";
import { cgnCategories } from "../store/actions/categories";
import { cgnDetails } from "../store/actions/details";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel,
  cgnEycaActivationStatusRequest
} from "../store/actions/eyca/activation";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSelectedMerchant
} from "../store/actions/merchants";
import { cgnGenerateOtp } from "../store/actions/otp";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";

export type TrackCgnStatus = "active" | "not_active";

// oxlint-disable-next-line complexity
const trackCgnAction = (action: Action): void => {
  switch (action.type) {
    case getType(cgnActivationBack):
    case getType(cgnActivationCancel):
    case getType(cgnActivationComplete):
    case getType(cgnActivationStart):
    case getType(cgnCategories.request): // Categories Actions
    case getType(cgnCategories.success):
    case getType(cgnCodeFromBucket.request): // Bucket Related Actions
    case getType(cgnDetails.request):
    case getType(cgnDetails.success):
    case getType(cgnEycaActivation.request): // EYCA Related Actions
    case getType(cgnEycaActivationCancel):
    case getType(cgnEycaActivationStatusRequest):
    case getType(cgnEycaStatus.request):
    case getType(cgnGenerateOtp.request): // OTP Related Actions
    case getType(cgnGenerateOtp.success):
    case getType(cgnOfflineMerchants.request): // Merchants Related Actions
    case getType(cgnOnlineMerchants.request):
    case getType(cgnRequestActivation):
    case getType(cgnSelectedMerchant.request):
    case getType(cgnSelectedMerchant.success):
    case getType(cgnUnsubscribe.request):
    case getType(cgnUnsubscribe.success):
      return mixpanelTrack(action.type);
    case getType(cgnActivationFailure):
      return mixpanelTrack(action.type, {
        reason: action.payload
      });
    case getType(cgnActivationStatus.failure):
      return mixpanelTrack(action.type, { reason: action.payload.message });
    case getType(cgnActivationStatus.success):
    case getType(cgnEycaStatus.success):
      return mixpanelTrack(action.type, { status: action.payload.status });
    case getType(cgnCategories.failure):
    case getType(cgnCodeFromBucket.failure):
    case getType(cgnDetails.failure):
    case getType(cgnEycaActivation.failure):
    case getType(cgnEycaStatus.failure):
    case getType(cgnGenerateOtp.failure):
    case getType(cgnOfflineMerchants.failure):
    case getType(cgnOnlineMerchants.failure):
    case getType(cgnSelectedMerchant.failure):
    case getType(cgnUnsubscribe.failure):
      return mixpanelTrack(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
    case getType(cgnCodeFromBucket.success):
      return mixpanelTrack(action.type, { status: action.payload.kind });
    case getType(cgnEycaActivation.success):
      return mixpanelTrack(action.type, { status: action.payload });
    case getType(cgnOfflineMerchants.success):
    case getType(cgnOnlineMerchants.success):
      return mixpanelTrack(action.type, {
        foundMerchants: action.payload.length
      });
  }
};

export default trackCgnAction;

type TrackCgnEngagementBannerEvent = "BANNER" | "CLOSE_BANNER" | "TAP_BANNER";

export const trackCgnEngagementBanner = (
  event: TrackCgnEngagementBannerEvent
) =>
  mixpanelTrack(
    event,
    buildEventProperties("UX", "action", {
      banner_id: "CGN_ACTIVATION",
      banner_page: "MESSAGES_HOME",
      banner_landing: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
    })
  );
