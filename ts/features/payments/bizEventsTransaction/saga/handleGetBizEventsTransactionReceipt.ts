import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsBizEventsReceiptAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { byteArrayToBase64 } from "../utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to get the transaction receipt pdf from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetBizEventsTransactionReceipt(
  getTransactionReceipt: TransactionClient["getPDFReceipt"],
  action: ActionType<(typeof getPaymentsBizEventsReceiptAction)["request"]>
) {
  try {
    const getTransactionReceiptResult = yield* withPaymentsSessionToken(
      getTransactionReceipt,
      getPaymentsBizEventsReceiptAction.failure,
      action,
      {
        "event-id": action.payload.transactionId
      },
      "Authorization"
    );

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
    } else if (getTransactionReceiptResult.right.status !== 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token

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
