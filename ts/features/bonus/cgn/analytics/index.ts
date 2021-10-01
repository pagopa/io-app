import { getType } from "typesafe-actions";
import { cgnEnabled } from "../../../../config";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import {
  cgnActivationComplete,
  cgnActivationStart,
  cgnActivationCancel,
  cgnActivationBack,
  cgnActivationStatus,
  cgnRequestActivation,
  cgnActivationFailure
} from "../store/actions/activation";
import { cgnDetails } from "../store/actions/details";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel,
  cgnEycaActivationStatusRequest
} from "../store/actions/eyca/activation";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnGenerateOtp } from "../store/actions/otp";

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
      case getType(cgnGenerateOtp.request): // OTP Related Actions
      case getType(cgnGenerateOtp.success):
      case getType(cgnEycaActivation.request): // EYCA Related Actions
      case getType(cgnEycaActivationStatusRequest):
      case getType(cgnEycaActivationCancel):
      case getType(cgnEycaStatus.request):
        return mp.track(action.type);
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

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default cgnEnabled ? trackCgnAction : emptyTracking;
