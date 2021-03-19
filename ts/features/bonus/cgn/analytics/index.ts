/* eslint-disable no-fallthrough */
// disabled in order to allows comments between the switch
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
  cgnActivationStatus
} from "../store/actions/activation";
import { cgnDetails } from "../store/actions/details";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel,
  cgnEycaActivationStatusRequest
} from "../store/actions/eyca/activation";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnGenerateOtp } from "../store/actions/otp";

const trackCgnAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    case getType(cgnActivationStart):
    case getType(cgnActivationComplete):
    case getType(cgnActivationCancel):
    case getType(cgnActivationBack):
    case getType(cgnDetails.request):
    case getType(cgnDetails.success):
    // OTP Related Actions
    case getType(cgnGenerateOtp.request):
    case getType(cgnGenerateOtp.success):
    // EYCA Related Actions
    case getType(cgnEycaActivation.request):
    case getType(cgnEycaActivationStatusRequest):
    case getType(cgnEycaActivationCancel):
    case getType(cgnEycaStatus.request):
      return mp.track(action.type);
    case getType(cgnEycaActivation.success):
      return mp.track(action.type, { activationStatus: action.payload });
    case getType(cgnEycaStatus.success):
      return mp.track(action.type, { detailStatus: action.payload.status });
    case getType(cgnActivationStatus.failure):
      return mp.track(action.type, { reason: action.payload.message });
    case getType(cgnDetails.failure):
    case getType(cgnGenerateOtp.failure):
    case getType(cgnEycaActivation.failure):
    case getType(cgnEycaStatus.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }

  return Promise.resolve();
};

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default cgnEnabled ? trackCgnAction : emptyTracking;
