import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsLatestBizEventsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

const DEFAULT_LATEST_TRANSACTION_LIST_SIZE = 5;

export function* handleGetLatestBizEventsTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<
    (typeof getPaymentsLatestBizEventsTransactionsAction)["request"]
  >
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
        getPaymentsLatestBizEventsTransactionsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (getTransactionListResult.right.status === 200) {
      yield* put(
        getPaymentsLatestBizEventsTransactionsAction.success(
          getTransactionListResult.right.value
        )
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsLatestBizEventsTransactionsAction.success([]));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        getPaymentsLatestBizEventsTransactionsAction.failure({
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
      getPaymentsLatestBizEventsTransactionsAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
