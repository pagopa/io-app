import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import {
  getNetworkErrorMessage,
  isTimeoutError
} from "../../../../../utils/errors";
import {
  addBPayToWallet,
  searchUserBPay,
  walletAddBPayBack,
  walletAddBPayCancel,
  walletAddBPayCompleted,
  walletAddBPayFailure,
  walletAddBPayStart
} from "../store/actions";

export const trackBPayAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(walletAddBPayStart):
      case getType(walletAddBPayCompleted):
      case getType(walletAddBPayCancel):
      case getType(walletAddBPayBack):
      case getType(addBPayToWallet.request):
      case getType(addBPayToWallet.success):
        return mp.track(action.type);
      case getType(searchUserBPay.request):
        return mp.track(action.type, { abi: action.payload ?? "all" });
      case getType(searchUserBPay.success):
        return mp.track(action.type, {
          count: action.payload.length,
          serviceStateList: action.payload.map(bPay =>
            bPay.serviceState?.toString()
          )
        });

      case getType(addBPayToWallet.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });

      case getType(searchUserBPay.failure):
        return mp.track(action.type, {
          reason: isTimeoutError(action.payload)
            ? action.payload.kind
            : action.payload.value.message
        });
      case getType(walletAddBPayFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
    }
    return Promise.resolve();
  };
