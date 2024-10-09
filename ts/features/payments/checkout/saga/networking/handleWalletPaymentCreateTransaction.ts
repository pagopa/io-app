import * as E from "fp-ts/lib/Either";
import { put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { IOToast } from "@pagopa/io-app-design-system";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCreateTransactionAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";
import { paymentAnalyticsDataSelector } from "../../../history/store/selectors";
import I18n from "../../../../../i18n";
import * as analytics from "../../analytics";
import { readablePrivacyReport } from "../../../../../utils/reporters";

const handleError = (
  paymentAnalyticsData: ReturnType<typeof paymentAnalyticsDataSelector>,
  onErrorCallback?: () => void
) => {
  IOToast.error(I18n.t("features.payments.errors.transactionCreationError"));
  analytics.trackPaymentMethodVerificaFatalError({
    organization_name: paymentAnalyticsData?.verifiedData?.paName,
    organization_fiscal_code: paymentAnalyticsData?.verifiedData?.paFiscalCode,
    service_name: paymentAnalyticsData?.serviceName,
    attempt: paymentAnalyticsData?.attempt,
    expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
  });
  if (onErrorCallback) {
    onErrorCallback();
  }
};

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransactionForIO"],
  action: ActionType<(typeof paymentsCreateTransactionAction)["request"]>
) {
  try {
    const newTransactionResult = yield* withPaymentsSessionToken(
      newTransaction,
      action,
      {
        body: action.payload.data
      },
      "pagoPAPlatformSessionToken"
    );

    const paymentAnalyticsData = yield* select(paymentAnalyticsDataSelector);
    if (E.isLeft(newTransactionResult)) {
      handleError(paymentAnalyticsData, action.payload.onError);
      yield* put(
        paymentsCreateTransactionAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(newTransactionResult.left))
          )
        })
      );
      return;
    }
    const status = newTransactionResult.right.status;
    if (status === 200) {
      yield* put(
        paymentsCreateTransactionAction.success(
          newTransactionResult.right.value
        )
      );
    } else if (status === 400) {
      // Handling unhandled error from third-party services (GEC) during payment verification.
      // This is not an internal backend error from pagoPA, but rather a third-party service error and should be handled differently.
      handleError(paymentAnalyticsData, action.payload.onError);
      yield* put(
        paymentsCreateTransactionAction.failure({
          ...getGenericError(
            new Error(`Error: ${newTransactionResult.right.status}`)
          )
        })
      );
    } else if (status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsCreateTransactionAction.failure(
          newTransactionResult.right.value
        )
      );
    }
  } catch (e) {
    yield* put(
      paymentsCreateTransactionAction.failure({ ...getNetworkError(e) })
    );
  }
}
