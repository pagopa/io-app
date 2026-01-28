import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import I18n from "i18next";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { TransactionClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import {
  hidePaymentsReceiptAction,
  getPaymentsLatestReceiptAction,
  setNeedsHomeListRefreshAction
} from "../store/actions";
import * as analytics from "../analytics";
/**
 * Handle the remote call to hide the transaction receipt
 * @param action
 */
export function* handleDisableReceipt(
  disablePaidNotice: TransactionClient["disablePaidNotice"],
  action: ActionType<(typeof hidePaymentsReceiptAction)["request"]>
) {
  const paymentsAnalyticsData = yield* select(paymentAnalyticsDataSelector);

  const handleHideReceiptFailure = () => {
    IOToast.error(
      I18n.t("features.payments.transactions.receipt.delete.failed")
    );

    analytics.trackHideReceiptFailure({
      organization_name: paymentsAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentsAnalyticsData?.receiptFirstTimeOpening,
      user: paymentsAnalyticsData?.receiptUser,
      trigger: action.payload.trigger
    });
  };

  const handleHideReceiptSuccess = () => {
    IOToast.success(
      I18n.t("features.payments.transactions.receipt.delete.successful")
    );
    analytics.trackHideReceiptSuccess({
      organization_name: paymentsAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentsAnalyticsData?.receiptFirstTimeOpening,
      user: paymentsAnalyticsData?.receiptUser,
      organization_fiscal_code:
        paymentsAnalyticsData?.receiptOrganizationFiscalCode,
      trigger: action.payload.trigger
    });
  };

  try {
    const getTransactionReceiptResult = yield* withPaymentsSessionToken(
      disablePaidNotice,
      action,
      {
        "event-id": action.payload.transactionId
      },
      "Authorization"
    );
    if (E.isLeft(getTransactionReceiptResult)) {
      handleHideReceiptFailure();
      yield* put(
        hidePaymentsReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionReceiptResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionReceiptResult.right.status === 200) {
      handleHideReceiptSuccess();

      yield* put(
        hidePaymentsReceiptAction.success(
          getTransactionReceiptResult.right.value
        )
      );
      // Set flag and refresh home list after successful hide
      yield* put(setNeedsHomeListRefreshAction(true));
      yield* put(getPaymentsLatestReceiptAction.request());
    } else if (getTransactionReceiptResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      handleHideReceiptFailure();

      yield* put(
        hidePaymentsReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionReceiptResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    handleHideReceiptFailure();

    yield* put(
      hidePaymentsReceiptAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
