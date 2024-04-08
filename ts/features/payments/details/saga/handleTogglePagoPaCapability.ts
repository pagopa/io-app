import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { WalletApplication } from "../../../../../definitions/pagopa/walletv3/WalletApplication";
import { WalletApplicationStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import {
  paymentsGetMethodDetailsAction,
  paymentsTogglePagoPaCapabilityAction
} from "../store/actions";
import { selectPaymentMethodDetails } from "../store/selectors";

/**
 * Handle the remote call to toggle the Wallet pagopa capability
 */
export function* handleTogglePagoPaCapability(
  updateWalletApplicationsById: WalletClient["updateWalletApplicationsById"],
  action: ActionType<(typeof paymentsTogglePagoPaCapabilityAction)["request"]>
) {
  try {
    const methodDetailsPot = yield* select(selectPaymentMethodDetails);
    const methodDetails = pot.toUndefined(methodDetailsPot);

    if (!methodDetails) {
      throw new Error("walletDetails is undefined");
    }
    const updatedApplications = methodDetails.applications.map(application => ({
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
        const successAction = paymentsTogglePagoPaCapabilityAction.success();
        yield* put(successAction);
        if (action.payload.onSuccess) {
          action.payload.onSuccess();
        }
        return;
      }
      // not handled error codes
      const failureAction = paymentsTogglePagoPaCapabilityAction.failure({
        ...getGenericError(
          new Error(`response status code ${updateWalletResult.right.status}`)
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure();
      }
    } else {
      // cannot decode response
      const failureAction = paymentsTogglePagoPaCapabilityAction.failure({
        ...getGenericError(
          new Error(readablePrivacyReport(updateWalletResult.left))
        )
      });
      yield* put(failureAction);
      if (action.payload.onFailure) {
        action.payload.onFailure();
      }
    }
  } catch (e) {
    yield* put(
      paymentsGetMethodDetailsAction.failure({ ...getNetworkError(e) })
    );
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
