import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  walletDetailsGetInstrument,
  walletDetailsPagoPaCapabilityToggle
} from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { walletDetailsInstrumentSelector } from "../store";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { WalletServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletServiceStatus";
import { Service } from "../../../../../definitions/pagopa/walletv3/Service";

/**
 * Handle the remote call to toggle the Wallet pagopa capability
 * @param getPaymentMethods
 * @param action
 */
export function* handleTogglePagoPaCapability(
  updateWalletServicesById: WalletClient["updateWalletServicesById"],
  action: ActionType<(typeof walletDetailsPagoPaCapabilityToggle)["request"]>
) {
  try {
    const walletDetails = yield* select(walletDetailsInstrumentSelector);
    if (!walletDetails) {
      throw new Error("walletDetails is undefined");
    }
    const updatedServices = walletDetails.services.map(service => ({
      ...service,
      status: updatePagoPaServiceStatus(service)
    }));

    const updateWalletPagoPaServicesRequest = updateWalletServicesById({
      walletId: action.payload.walletId,
      body: {
        services: updatedServices
      }
    });
    const updateWalletResult = (yield* call(
      withRefreshApiCall,
      updateWalletPagoPaServicesRequest,
      action
    )) as unknown as SagaCallReturnType<typeof updateWalletServicesById>;
    if (E.isRight(updateWalletResult)) {
      if (updateWalletResult.right.status === 204) {
        // handled success
        const successAction = walletDetailsPagoPaCapabilityToggle.success();
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess(successAction);
        }
        return;
      }
      // not handled error codes
      const failureAction = walletDetailsPagoPaCapabilityToggle.failure({
        ...getGenericError(
          new Error(`response status code ${updateWalletResult.right.status}`)
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure(failureAction);
      }
    } else {
      // cannot decode response
      const failureAction = walletDetailsPagoPaCapabilityToggle.failure({
        ...getGenericError(
          new Error(readablePrivacyReport(updateWalletResult.left))
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure(failureAction);
      }
    }
  } catch (e) {
    yield* put(walletDetailsGetInstrument.failure({ ...getNetworkError(e) }));
  }
}

const updatePagoPaServiceStatus = (
  service: Service
): WalletServiceStatusEnum => {
  if (service.name === ServiceNameEnum.PAGOPA) {
    return service.status === WalletServiceStatusEnum.DISABLED
      ? WalletServiceStatusEnum.ENABLED
      : WalletServiceStatusEnum.DISABLED;
  }
  return service.status;
};
