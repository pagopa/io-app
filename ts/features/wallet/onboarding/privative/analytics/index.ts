import { getType } from "typesafe-actions";
import { PrivativeServices } from "../../../../../../definitions/pagopa/privative/configuration/PrivativeServices";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../../utils/errors";
import { trackCobadgeResponse } from "../../cobadge/analytics";
import {
  addPrivativeToWallet,
  loadPrivativeIssuers,
  searchUserPrivative,
  walletAddPrivativeBack,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted,
  walletAddPrivativeStart
} from "../store/actions";

export const trackCoBadgeAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    case getType(walletAddPrivativeStart):
    case getType(walletAddPrivativeCompleted):
    case getType(walletAddPrivativeCancel):
    case getType(walletAddPrivativeBack):
    case getType(addPrivativeToWallet.request):
    case getType(loadPrivativeIssuers.request):
      return mp.track(action.type);
    case getType(searchUserPrivative.request):
      return mp.track(action.type, { abi: action.payload });
    case getType(loadPrivativeIssuers.success):
      return mp.track(action.type, trackPrivativeIssuers(action.payload));
    case getType(searchUserPrivative.success):
      return mp.track(action.type, trackCobadgeResponse(action.payload));
    case getType(addPrivativeToWallet.success):
      return mp.track(action.type, {
        abi: action.payload.info.issuerAbiCode
      });
    case getType(addPrivativeToWallet.failure):
    case getType(loadPrivativeIssuers.failure):
    case getType(searchUserPrivative.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }
  return Promise.resolve();
};

/**
 * Transform a {@link PrivativeServices} into a MixpanelPayload
 * @param cobadgeSettings
 */
const trackPrivativeIssuers = (
  cobadgeSettings: PrivativeServices
): Record<string, unknown> =>
  Object.keys(cobadgeSettings).reduce<Record<string, unknown>>(
    (acc, val) => ({ ...acc, [`${val}service`]: cobadgeSettings[val].status }),
    {
      serviceProviders: Object.keys(cobadgeSettings)
    }
  );
