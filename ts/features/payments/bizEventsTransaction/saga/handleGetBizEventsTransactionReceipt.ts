import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsBizEventsReceiptAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { SagaCallReturnType } from "../../../../types/utils";
import { byteArrayToBase64 } from "../utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { paymentsResetPagoPaPlatformSessionTokenAction } from "../../common/store/actions";

/**
 * Handle the remote call to get the transaction receipt pdf from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetBizEventsTransactionReceipt(
  getTransactionReceipt: TransactionClient["getPDFReceipt"],
  action: ActionType<(typeof getPaymentsBizEventsReceiptAction)["request"]>
) {
  const getTransactionReceiptRequest = yield* withPaymentsSessionToken(
    getTransactionReceipt,
    getPaymentsBizEventsReceiptAction.failure,
    {
      "event-id": action.payload.transactionId
    },
    "Authorization"
  );

  try {
    const getTransactionReceiptResult = (yield* call(
      withRefreshApiCall,
      getTransactionReceiptRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionReceipt>;

    if (E.isLeft(getTransactionReceiptResult)) {
      yield* put(
        getPaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionReceiptResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionReceiptResult.right.status === 200) {
      const base64File = byteArrayToBase64(
        getTransactionReceiptResult.right.value
      );
      action.payload.onSuccess?.();
      yield* put(getPaymentsBizEventsReceiptAction.success(base64File));
    } else if (getTransactionReceiptResult.right.status === 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token
      yield* put(paymentsResetPagoPaPlatformSessionTokenAction());
    } else {
      action.payload.onError?.();
      yield* put(
        getPaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionReceiptResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    action.payload.onError?.();
    yield* put(
      getPaymentsBizEventsReceiptAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
