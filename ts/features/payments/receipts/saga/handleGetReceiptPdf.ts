import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsReceiptDownloadAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { byteArrayToBase64 } from "../utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { DownloadReceiptHeaders } from "../utils/types";

/**
 * Handle the remote call to get the transaction receipt pdf from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetReceiptPdf(
  getTransactionReceipt: TransactionClient["generatePDF"],
  action: ActionType<(typeof getPaymentsReceiptDownloadAction)["request"]>
) {
  try {
    const getTransactionReceiptResult = yield* withPaymentsSessionToken(
      getTransactionReceipt,
      action,
      {
        "event-id": action.payload.transactionId
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionReceiptResult)) {
      action.payload.onError?.();
      yield* put(
        getPaymentsReceiptDownloadAction.failure({
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
      // Extract the filename from the content-disposition header if present
      const filename = pipe(
        getTransactionReceiptResult.right.headers,
        DownloadReceiptHeaders.decode,
        E.map(headers => headers.map["content-disposition"]),
        E.map(contentDisposition =>
          contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        ),
        E.getOrElseW(() => undefined)
      );
      action.payload.onSuccess?.();
      yield* put(
        getPaymentsReceiptDownloadAction.success({ base64File, filename })
      );
    } else if (getTransactionReceiptResult.right.status !== 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token

      action.payload.onError?.();
      yield* put(
        getPaymentsReceiptDownloadAction.failure({
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
      getPaymentsReceiptDownloadAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
