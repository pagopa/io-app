import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsNoticeDetailsAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to get the transaction details from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetNoticeDetails(
  getTransactionDetails: TransactionClient["getPaidNoticeDetail"],
  action: ActionType<(typeof getPaymentsNoticeDetailsAction)["request"]>
) {
  try {
    const getTransactionDetailsResult = yield* withPaymentsSessionToken(
      getTransactionDetails,
      action,
      {
        "event-id": action.payload.transactionId
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionDetailsResult)) {
      yield* put(
        getPaymentsNoticeDetailsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionDetailsResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionDetailsResult.right.status === 200) {
      yield* put(
        getPaymentsNoticeDetailsAction.success(
          getTransactionDetailsResult.right.value
        )
      );
    } else if (getTransactionDetailsResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        getPaymentsNoticeDetailsAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionDetailsResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      getPaymentsNoticeDetailsAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
