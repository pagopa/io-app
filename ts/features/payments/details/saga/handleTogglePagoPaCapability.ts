import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { ServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/ServiceStatus";
import { WalletService } from "../../../../../definitions/pagopa/walletv3/WalletService";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import { walletDetailsInstrumentSelector } from "../store";
import {
  walletDetailsGetInstrument,
  walletDetailsPagoPaCapabilityToggle
} from "../store/actions";

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
    const updatedServices = walletDetails.services.map(service => {
      if (service.name === ServiceNameEnum.PAGOPA) {
        return {
          ...service,
          status: action.payload.enable
            ? ServiceStatusEnum.ENABLED
            : ServiceStatusEnum.DISABLED
        };
      }
      return service;
    });

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
    )) as SagaCallReturnType<typeof updateWalletServicesById>;

    yield* pipe(
      updateWalletResult,
      E.fold(
        function* (error) {
          yield* put(
            walletDetailsPagoPaCapabilityToggle.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
          action.payload.onFailure?.();
        },
        function* ({ status, value }) {
          switch (status) {
            case 204:
              yield* put(walletDetailsPagoPaCapabilityToggle.success(value));
              action.payload.onSuccess?.();
              break;
            default:
              yield* put(
                walletDetailsPagoPaCapabilityToggle.failure(
                  getGenericError(new Error(`response status code ${status}`))
                )
              );
              action.payload.onFailure?.();
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletDetailsGetInstrument.failure({ ...getNetworkError(e) }));
  }
}
