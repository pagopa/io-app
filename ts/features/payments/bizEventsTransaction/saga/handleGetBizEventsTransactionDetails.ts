import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsBizEventsTransactionDetailsAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to get the transaction details from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetBizEventsTransactionDetails(
  getTransactionDetails: TransactionClient["getTransactionDetails"],
  action: ActionType<
    (typeof getPaymentsBizEventsTransactionDetailsAction)["request"]
  >
) {
  try {
    const getTransactionDetailsResult = yield* withPaymentsSessionToken(
      getTransactionDetails,
      getPaymentsBizEventsTransactionDetailsAction.failure,
      action,
      {
        "transaction-id": action.payload.transactionId
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionDetailsResult)) {
      yield* put(
        getPaymentsBizEventsTransactionDetailsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionDetailsResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionDetailsResult.right.status === 200) {
      yield* put(
        getPaymentsBizEventsTransactionDetailsAction.success(
          getTransactionDetailsResult.right.value
        )
      );
    } else if (getTransactionDetailsResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        getPaymentsBizEventsTransactionDetailsAction.failure({
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
      getPaymentsBizEventsTransactionDetailsAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
