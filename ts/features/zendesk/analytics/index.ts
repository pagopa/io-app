import { getType } from "typesafe-actions";
import { constVoid } from "fp-ts/lib/function";
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
import { mixpanelTrack } from "../../../mixpanel";

const trackZendesk = (action: Action): void => {
  switch (action.type) {
    case getType(zendeskSupportCompleted):
    case getType(zendeskSupportCancel):
    case getType(getZendeskConfig.request):
    case getType(getZendeskConfig.success):
    case getType(getZendeskPaymentConfig.success):
    case getType(getZendeskPaymentConfig.request):
      return mixpanelTrack(action.type);
    case getType(zendeskSupportStart):
      return mixpanelTrack(action.type, {
        isAssistanceForPayment: !!action.payload.assistanceType.payment,
        isAssistanceForCard: !!action.payload.assistanceType.card,
        isAssistanceForFci: !!action.payload.assistanceType.fci,
        isAssistanceForItWallet: !!action.payload.assistanceType.itWallet
      });
    case getType(zendeskSupportFailure):
      return mixpanelTrack(action.type, {
        reason: action.payload
      });
    case getType(zendeskSelectedCategory):
      return mixpanelTrack(action.type, {
        category: action.payload.value
      });
    case getType(getZendeskConfig.failure):
    case getType(getZendeskPaymentConfig.failure):
      return mixpanelTrack(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }
};

const emptyTracking = (__: Action) => constVoid();

export default zendeskEnabled ? trackZendesk : emptyTracking;
