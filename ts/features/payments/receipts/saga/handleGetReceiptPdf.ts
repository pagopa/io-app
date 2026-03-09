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
import {
  DownloadReceiptOutcomeErrorEnum,
  ReceiptDownloadFailure
} from "../types";

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
      const uint8Array = new Uint8Array(
        getTransactionReceiptResult.right.value
      );
      const base64File = byteArrayToBase64(uint8Array);
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
      const apiErrorCode = getTransactionReceiptResult.right.value?.code;
      const statusCode = getTransactionReceiptResult.right.status;

      if (
        apiErrorCode &&
        apiErrorCode === DownloadReceiptOutcomeErrorEnum.AT_404_002
      ) {
        // In that specific case we need to call show the info alert since the receipt is under generation
        action.payload.onErrorGeneration?.();
      } else {
        action.payload.onError?.();
      }
      const failure: ReceiptDownloadFailure = {
        ...getGenericError(new Error(`response status code ${statusCode}`)),
        code: apiErrorCode as DownloadReceiptOutcomeErrorEnum | undefined
      };
      yield* put(getPaymentsReceiptDownloadAction.failure(failure));
    }
  } catch (e) {
    yield* put(getPaymentsReceiptDownloadAction.failure(getNetworkError(e)));
    action.payload.onError?.();
  }
}
