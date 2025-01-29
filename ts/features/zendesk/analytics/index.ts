import { getType } from "typesafe-actions";
import { constVoid } from "fp-ts/lib/function";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";

import { zendeskEnabled } from "../../../config";
import { getNetworkErrorMessage } from "../../../utils/errors";
import {
  getZendeskConfig,
  getZendeskPaymentConfig,
  zendeskSelectedCategory,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../store/actions";

const trackZendesk =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): void => {
    switch (action.type) {
      case getType(zendeskSupportCompleted):
      case getType(zendeskSupportCancel):
      case getType(getZendeskConfig.request):
      case getType(getZendeskConfig.success):
      case getType(getZendeskPaymentConfig.success):
      case getType(getZendeskPaymentConfig.request):
        return mp.track(action.type);
      case getType(zendeskSupportStart):
        return mp.track(action.type, {
          isAssistanceForPayment: !!action.payload.assistanceType.payment,
          isAssistanceForCard: !!action.payload.assistanceType.card,
          isAssistanceForFci: !!action.payload.assistanceType.fci,
          isAssistanceForItWallet: !!action.payload.assistanceType.itWallet
        });
      case getType(zendeskSupportFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
      case getType(zendeskSelectedCategory):
        return mp.track(action.type, {
          category: action.payload.value
        });
      case getType(getZendeskConfig.failure):
      case getType(getZendeskPaymentConfig.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
    }
  };

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  constVoid();

export default zendeskEnabled ? trackZendesk : emptyTracking;
