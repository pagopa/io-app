import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import {
  getNetworkErrorMessage,
  isTimeoutError
} from "../../../../../utils/errors";
import {
  searchUserBPay,
  walletAddBPayBack
} from "../../bancomatPay/store/actions";
import {
  addCoBadgeToWallet,
  searchUserCoBadge,
  walletAddCoBadgeBack,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted,
  walletAddCoBadgeStart
} from "../store/actions";

export const trackBPayAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    case getType(walletAddCoBadgeStart):
      return mp.track(action.type, {
        abi: action.payload
      });
    case getType(walletAddCoBadgeCompleted):
    case getType(walletAddCoBadgeCancel):
    case getType(walletAddCoBadgeBack):
    case getType(addCoBadgeToWallet.request):
    case getType(addCoBadgeToWallet.success):
      return mp.track(action.type);
    case getType(searchUserCoBadge.request):
      return mp.track(action.type, { abi: action.payload ?? "all" });
    case getType(searchUserCoBadge.success):
      return mp.track(action.type, {
        count: action.payload.payload?.paymentInstruments?.length,
        status: action.payload.status,

        serviceStateList: action.payload.map(bPay =>
          bPay.serviceState?.toString()
        )
      });

    case getType(addCoBadgeToWallet.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });

    case getType(searchUserCoBadge.failure):
      return mp.track(action.type, {
        reason: isTimeoutError(action.payload)
          ? action.payload.kind
          : action.payload.value.message
      });
  }
  return Promise.resolve();
};
