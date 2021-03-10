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
  cgnRequestActivation
} from "../store/actions/activation";
import { cgnDetails } from "../store/actions/details";

const trackAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    case getType(cgnActivationStart):
    case getType(cgnActivationComplete):
    case getType(cgnActivationCancel):
    case getType(cgnActivationBack):
    case getType(cgnActivationStatus.request):
    case getType(cgnActivationStatus.success):
    case getType(cgnRequestActivation.request):
    case getType(cgnRequestActivation.success):
    case getType(cgnDetails.request):
    case getType(cgnDetails.success):
      return mp.track(action.type);
    case getType(cgnActivationStatus.failure):
      return mp.track(action.type, { reason: action.payload.message });
    case getType(cgnDetails.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }

  return Promise.resolve();
};

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default cgnEnabled ? trackAction : emptyTracking;
