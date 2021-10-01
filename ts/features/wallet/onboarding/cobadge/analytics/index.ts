import { getType } from "typesafe-actions";
import { CoBadgeServices } from "../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { CobadgeResponse } from "../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { ExecutionStatusEnum } from "../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { mixpanel } from "../../../../../mixpanel";
import { Action } from "../../../../../store/actions/types";
import { getNetworkErrorMessage } from "../../../../../utils/errors";
import { sendAddCobadgeMessage } from "../../../../../store/actions/wallet/wallets";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge,
  walletAddCoBadgeBack,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted,
  walletAddCoBadgeFailure,
  walletAddCoBadgeStart
} from "../store/actions";

export const trackCoBadgeAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
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

      case getType(walletAddCoBadgeFailure):
        return mp.track(action.type, {
          reason: action.payload
        });
      case getType(sendAddCobadgeMessage):
        return mp.track(action.type, { canAdd: action.payload });
    }
    return Promise.resolve();
  };

/**
 * Transform a {@link CobadgeResponse} into a {@link MixpanelPayload}
 * @param response
 */
export const trackCobadgeResponse = (
  response: CobadgeResponse
): Record<string, unknown> | undefined =>
  response.payload?.searchRequestMetadata?.reduce<Record<string, unknown>>(
    (acc, val) => {
      if (val.serviceProviderName !== undefined) {
        return {
          ...acc,
          [`${val.serviceProviderName}executionStatus`]: val.executionStatus,
          [`${val.serviceProviderName}retrievedInstrumentsCount`]:
            val.retrievedInstrumentsCount
        };
      }
      return acc;
    },
    {
      serviceProviders: response.payload?.searchRequestMetadata?.map(s =>
        s.serviceProviderName?.toString()
      ),
      anyServiceError: response.payload?.searchRequestMetadata.some(
        m => m.executionStatus === ExecutionStatusEnum.KO
      ),
      anyServicePending: response.payload?.searchRequestMetadata.some(
        m => m.executionStatus === ExecutionStatusEnum.PENDING
      ),
      count: response.payload?.paymentInstruments?.length,
      status: response.status
    } as Record<string, unknown>
  );

/**
 * Transform a {@link CoBadgeServices} into a {@link MixpanelPayload}
 * @param cobadgeSettings
 */
const trackCoBadgeServices = (cobadgeSettings: CoBadgeServices) =>
  Object.keys(cobadgeSettings).reduce<Record<string, unknown>>(
    (acc, val) => ({ ...acc, [`${val}service`]: cobadgeSettings[val].status }),
    {
      serviceProviders: Object.keys(cobadgeSettings)
    }
  );
