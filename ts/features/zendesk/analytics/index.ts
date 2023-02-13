import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";

import { zendeskEnabled } from "../../../config";
import { getNetworkErrorMessage } from "../../../utils/errors";
import {
  getZendeskConfig,
  zendeskSelectedCategory,
  zendeskSupportCancel,
  zendeskSupportCompleted,
  zendeskSupportFailure,
  zendeskSupportStart
} from "../store/actions";

const trackZendesk =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(zendeskSupportCompleted):
      case getType(zendeskSupportCancel):
      case getType(getZendeskConfig.request):
      case getType(getZendeskConfig.success):
        return mp.track(action.type);
      case getType(zendeskSupportStart):
        return mp.track(action.type, {
          isAssistanceForPayment: action.payload.assistanceForPayment,
          isAssistanceForCard: action.payload.assistanceForCard
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
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
    }
    return Promise.resolve();
  };

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();

export default zendeskEnabled ? trackZendesk : emptyTracking;
