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
import { WalletApplication } from "../../../../../definitions/pagopa/walletv3/WalletApplication";
import { WalletApplicationStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";

/**
 * Handle the remote call to toggle the Wallet pagopa capability
 */
export function* handleTogglePagoPaCapability(
  updateWalletApplicationsById: WalletClient["updateWalletApplicationsById"],
  action: ActionType<(typeof walletDetailsPagoPaCapabilityToggle)["request"]>
) {
  try {
    const walletDetails = yield* select(walletDetailsInstrumentSelector);
    if (!walletDetails) {
      throw new Error("walletDetails is undefined");
    }
    const updatedApplications = walletDetails.applications.map(application => ({
      ...application,
      status: updatePagoPaApplicationStatus(application)
    }));

    const updateWalletPagoPaApplicationRequest = updateWalletApplicationsById({
      walletId: action.payload.walletId,
      body: {
        applications: updatedApplications as Array<WalletApplication>
      }
    });
    const updateWalletResult = (yield* call(
      withRefreshApiCall,
      updateWalletPagoPaApplicationRequest,
      action
    )) as unknown as SagaCallReturnType<typeof updateWalletApplicationsById>;
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

const updatePagoPaApplicationStatus = (
  application: WalletApplication
): WalletApplicationStatusEnum | undefined => {
  if (application.name === "PAGOPA") {
    return application.status === WalletApplicationStatusEnum.DISABLED
      ? WalletApplicationStatusEnum.ENABLED
      : WalletApplicationStatusEnum.DISABLED;
  }
  return application.status;
};
