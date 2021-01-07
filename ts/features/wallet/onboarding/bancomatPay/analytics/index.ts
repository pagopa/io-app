import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../../utils/errors";
import { searchUserBPay } from "../store/actions";

const trackAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<void> => {
  switch (action.type) {
    case getType(searchUserBPay.request):
      return mp.track(action.type);
    case getType(searchUserBPay.success):
      return mp.track(action.type, {
        count: action.payload.length
      });
    case getType(searchUserBPay.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }
  return Promise.resolve();
};

export default trackAction;
