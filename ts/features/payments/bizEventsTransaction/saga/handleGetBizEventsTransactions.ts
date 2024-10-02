import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsBizEventsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BizEventsHeaders } from "../utils/types";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

export function* handleGetBizEventsTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<(typeof getPaymentsBizEventsTransactionsAction)["request"]>
) {
  try {
    const getTransactionListResult = yield* withPaymentsSessionToken(
      getTransactionList,
      action,
      {
        size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
        "x-continuation-token": action.payload.continuationToken
      },
      "Authorization"
    );

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsBizEventsTransactionsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (getTransactionListResult.right.status === 200) {
      const continuationToken = pipe(
        getTransactionListResult.right.headers,
        BizEventsHeaders.decode,
        E.map(headers => headers.map["x-continuation-token"]),
        E.getOrElseW(() => undefined)
      );
      action.payload.onSuccess?.(continuationToken);
      yield* put(
        getPaymentsBizEventsTransactionsAction.success({
          data: getTransactionListResult.right.value,
          appendElements: action.payload.firstLoad
        })
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsBizEventsTransactionsAction.success({ data: [] }));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token

      yield* put(
        getPaymentsBizEventsTransactionsAction.failure({
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
      getPaymentsBizEventsTransactionsAction.failure({ ...getNetworkError(e) })
    );
  }
}
