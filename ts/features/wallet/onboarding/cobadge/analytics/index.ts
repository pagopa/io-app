import { getType } from "typesafe-actions";
import { CoBadgeServices } from "../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { CobadgeResponse } from "../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../../utils/errors";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge,
  walletAddCoBadgeBack,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted,
  walletAddCoBadgeStart
} from "../store/actions";

export const trackCoBadgeAction = (mp: NonNullable<typeof mixpanel>) => (
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
    case getType(loadCoBadgeAbiConfiguration.request):
      return mp.track(action.type);
    case getType(searchUserCoBadge.request):
      return mp.track(action.type, { abi: action.payload ?? "all" });
    case getType(loadCoBadgeAbiConfiguration.success):
      return mp.track(action.type, trackCoBadgeServices(action.payload));
    case getType(searchUserCoBadge.success):
      return mp.track(action.type, trackCobadgeResponse(action.payload));
    case getType(addCoBadgeToWallet.success):
      return mp.track(action.type, {
        abi: action.payload.info.issuerAbiCode
      });
    case getType(addCoBadgeToWallet.failure):
    case getType(loadCoBadgeAbiConfiguration.failure):
    case getType(searchUserCoBadge.failure):
      return mp.track(action.type, {
        reason: getNetworkErrorMessage(action.payload)
      });
  }
  return Promise.resolve();
};

type MixpanelPayload = {
  [key: string]: string | number | ReadonlyArray<string> | undefined;
};

/**
 * Transform a {@link CobadgeResponse} into a {@link MixpanelPayload}
 * @param response
 */
const trackCobadgeResponse = (
  response: CobadgeResponse
): MixpanelPayload | undefined =>
  response.payload?.searchRequestMetadata?.reduce<MixpanelPayload>(
    (acc, val) => {
      if (val.serviceProviderName !== undefined) {
        return {
          ...acc,
          [`${val.serviceProviderName}executionStatus`]: val.executionStatus,
          [`${val.serviceProviderName}retrievedInstrumentsCount`]: val.retrievedInstrumentsCount
        };
      }
      return acc;
    },
    {
      serviceProviders: response.payload?.searchRequestMetadata?.map(s =>
        s.serviceProviderName?.toString()
      ),
      count: response.payload?.paymentInstruments?.length,
      status: response.status
    } as MixpanelPayload
  );

/**
 * Transform a {@link CoBadgeServices} into a {@link MixpanelPayload}
 * @param cobadgeSettings
 */
const trackCoBadgeServices = (cobadgeSettings: CoBadgeServices) =>
  Object.keys(cobadgeSettings).reduce<MixpanelPayload>(
    (acc, val) => ({ ...acc, [`${val}service`]: cobadgeSettings[val].status }),
    {
      serviceProviders: Object.keys(cobadgeSettings)
    }
  );
