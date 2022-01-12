import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import {
  searchPaypalPsp,
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalCompleted,
  walletAddPaypalFailure,
  walletAddPaypalOutcome,
  walletAddPaypalPspSelected,
  walletAddPaypalRefreshPMToken,
  walletAddPaypalStart
} from "../store/actions";
import { getNetworkErrorMessage } from "../../../../../utils/errors";

const trackPaypalOnboarding =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(walletAddPaypalFailure):
      case getType(walletAddPaypalCancel):
      case getType(walletAddPaypalBack):
      case getType(walletAddPaypalCompleted):
      case getType(walletAddPaypalStart):
      case getType(walletAddPaypalRefreshPMToken.request):
      case getType(walletAddPaypalRefreshPMToken.success):
      case getType(searchPaypalPsp.request):
        return mp.track(action.type);
      case getType(walletAddPaypalPspSelected):
        return mp.track(action.type, {
          psp: action.payload.name
        });
      case getType(walletAddPaypalOutcome):
        return mp.track(action.type, {
          outcome: action.payload.toUndefined()
        });
      case getType(searchPaypalPsp.success):
        return mp.track(action.type, {
          count: action.payload.length
        });
      case getType(walletAddPaypalRefreshPMToken.failure):
        return mp.track(action.type, {
          reason: action.payload.message
        });
      case getType(searchPaypalPsp.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
    }
    return Promise.resolve();
  };

export default trackPaypalOnboarding;
