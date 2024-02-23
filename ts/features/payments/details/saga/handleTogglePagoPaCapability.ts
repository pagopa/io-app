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
import { Service } from "../../../../../definitions/pagopa/walletv3/Service";
import { ServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/ServiceStatus";
import { WalletService } from "../../../../../definitions/pagopa/walletv3/WalletService";

/**
 * Handle the remote call to toggle the Wallet pagopa capability
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
        services: updatedServices as Array<WalletService>
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
): ServiceStatusEnum | undefined => {
  if (service.name === ServiceNameEnum.PAGOPA) {
    return service.status === ServiceStatusEnum.DISABLED
      ? ServiceStatusEnum.ENABLED
      : ServiceStatusEnum.DISABLED;
  }
  return service.status;
};
