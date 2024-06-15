import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsBizEventsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { getOrFetchWalletSessionToken } from "../../checkout/saga/networking/handleWalletPaymentNewSessionToken";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BizEventsHeaders } from "../utils/types";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

export function* handleGetBizEventsTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<(typeof getPaymentsBizEventsTransactionsAction)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      getPaymentsBizEventsTransactionsAction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }
  const getTransactionListRequest = getTransactionList({
    size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
    Authorization: sessionToken,
    "x-continuation-token": action.payload.continuationToken
  });

  try {
    const getTransactionListResult = (yield* call(
      withRefreshApiCall,
      getTransactionListRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionList>;

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
      // The 401 status is handled by the withRefreshApiCall
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
