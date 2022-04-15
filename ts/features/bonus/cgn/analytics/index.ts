import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure,
  cgnActivationStart,
  cgnActivationStatus,
  cgnRequestActivation
} from "../store/actions/activation";
import { cgnDetails } from "../store/actions/details";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel,
  cgnEycaActivationStatusRequest
} from "../store/actions/eyca/activation";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnGenerateOtp } from "../store/actions/otp";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSelectedMerchant
} from "../store/actions/merchants";
import { cgnCodeFromBucket } from "../store/actions/bucket";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { cgnCategories } from "../store/actions/categories";

const trackCgnAction =
  (mp: NonNullable<typeof mixpanel>) =>
  // eslint-disable-next-line complexity
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(cgnActivationStart):
      case getType(cgnRequestActivation):
      case getType(cgnActivationComplete):
      case getType(cgnActivationCancel):
      case getType(cgnActivationBack):
      case getType(cgnDetails.request):
      case getType(cgnDetails.success):
      case getType(cgnOfflineMerchants.request): // Merchants Related Actions
      case getType(cgnOnlineMerchants.request):
      case getType(cgnSelectedMerchant.request):
      case getType(cgnSelectedMerchant.success):
      case getType(cgnGenerateOtp.request): // OTP Related Actions
      case getType(cgnGenerateOtp.success):
      case getType(cgnCodeFromBucket.request): // Bucket Related Actions
      case getType(cgnCategories.request): // Categories Actions
      case getType(cgnCategories.success):
      case getType(cgnEycaActivation.request): // EYCA Related Actions
      case getType(cgnEycaActivationStatusRequest):
      case getType(cgnEycaActivationCancel):
      case getType(cgnEycaStatus.request):
      case getType(cgnUnsubscribe.request):
      case getType(cgnUnsubscribe.success):
        return mp.track(action.type);
      case getType(cgnOfflineMerchants.success):
      case getType(cgnOnlineMerchants.success):
        return mp.track(action.type, { foundMerchants: action.payload.length });
      case getType(cgnCodeFromBucket.success):
        return mp.track(action.type, { status: action.payload.kind });
      case getType(cgnEycaStatus.success):
      case getType(cgnActivationStatus.success):
        return mp.track(action.type, { status: action.payload.status });
      case getType(cgnEycaActivation.success):
        return mp.track(action.type, { status: action.payload });
      case getType(cgnActivationStatus.failure):
        return mp.track(action.type, { reason: action.payload.message });
      case getType(cgnDetails.failure):
      case getType(cgnGenerateOtp.failure):
      case getType(cgnEycaActivation.failure):
      case getType(cgnEycaStatus.failure):
      case getType(cgnOfflineMerchants.failure):
      case getType(cgnOnlineMerchants.failure):
      case getType(cgnSelectedMerchant.failure):
      case getType(cgnCodeFromBucket.failure):
      case getType(cgnCategories.failure):
      case getType(cgnUnsubscribe.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
      case getType(cgnActivationFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
    }
    return Promise.resolve();
  };

export default trackCgnAction;
