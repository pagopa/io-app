import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { TransactionClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { getPaymentsReceiptAction } from "../store/actions";
import { getReceiptContinuationToken } from "../utils";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

export function* handleGetReceipt(
  getTransactionList: TransactionClient["getPaidNotices"],
  action: ActionType<(typeof getPaymentsReceiptAction)["request"]>
) {
  try {
    const getTransactionListResult = yield* withPaymentsSessionToken(
      getTransactionList,
      action,
      {
        size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
        "x-continuation-token": action.payload.continuationToken,
        is_debtor: action.payload.noticeCategory === "debtor" || undefined,
        is_payer: action.payload.noticeCategory === "payer" || undefined
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (getTransactionListResult.right.status === 200) {
      const continuationToken = getReceiptContinuationToken(
        getTransactionListResult.right.headers
      );
      action.payload.onSuccess?.(continuationToken);
      yield* put(
        getPaymentsReceiptAction.success({
          data: getTransactionListResult.right.value.notices,
          appendElements: action.payload.firstLoad
        })
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsReceiptAction.success({ data: [] }));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token

      yield* put(
        getPaymentsReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionListResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(getPaymentsReceiptAction.failure({ ...getNetworkError(e) }));
  }
}
