import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsLatestReceiptAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

const DEFAULT_LATEST_TRANSACTION_LIST_SIZE = 5;

export function* handleGetLatestReceipt(
  getTransactionList: TransactionClient["getPaidNotices"],
  action: ActionType<(typeof getPaymentsLatestReceiptAction)["request"]>
) {
  try {
    const getTransactionListResult = yield* withPaymentsSessionToken(
      getTransactionList,
      action,
      {
        size: DEFAULT_LATEST_TRANSACTION_LIST_SIZE
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsLatestReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (getTransactionListResult.right.status === 200) {
      yield* put(
        getPaymentsLatestReceiptAction.success(
          getTransactionListResult.right.value.notices
        )
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsLatestReceiptAction.success([]));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        getPaymentsLatestReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionListResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      getPaymentsLatestReceiptAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
