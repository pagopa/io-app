import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import {
  addSatispayToWallet,
  searchUserSatispay,
  walletAddSatispayBack,
  walletAddSatispayCancel,
  walletAddSatispayCompleted,
  walletAddSatispayFailure,
  walletAddSatispayStart
} from "../../onboarding/satispay/store/actions";

const trackAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(searchUserSatispay.request):
      case getType(walletAddSatispayStart):
      case getType(walletAddSatispayCompleted):
      case getType(walletAddSatispayCancel):
      case getType(walletAddSatispayBack):
      case getType(addSatispayToWallet.request):
      case getType(addSatispayToWallet.success):
        return mp.track(action.type);

      case getType(searchUserSatispay.success):
        return mp.track(action.type, {
          count: action.payload !== undefined ? 1 : 0
        });

      case getType(searchUserSatispay.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });

      case getType(addSatispayToWallet.failure):
        return mp.track(action.type, { reason: action.payload.message });
      case getType(walletAddSatispayFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
    }
    return Promise.resolve();
  };

export default trackAction;
