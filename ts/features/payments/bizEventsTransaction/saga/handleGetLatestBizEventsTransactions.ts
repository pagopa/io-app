import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsLatestBizEventsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { paymentsResetPagoPaPlatformSessionTokenAction } from "../../common/store/actions";

const DEFAULT_LATEST_TRANSACTION_LIST_SIZE = 5;

export function* handleGetLatestBizEventsTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<
    (typeof getPaymentsLatestBizEventsTransactionsAction)["request"]
  >
) {
  const getTransactionListRequest = yield* withPaymentsSessionToken(
    getTransactionList,
    getPaymentsLatestBizEventsTransactionsAction.failure,
    {
      size: DEFAULT_LATEST_TRANSACTION_LIST_SIZE
    },
    "Authorization"
  );

  if (!getTransactionListRequest) {
    return;
  }

  try {
    const getTransactionListResult = (yield* call(
      withRefreshApiCall,
      getTransactionListRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionList>;

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
    } else if (getTransactionListResult.right.status === 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token
      yield* put(paymentsResetPagoPaPlatformSessionTokenAction());
    } else {
      // The 401 status is handled by the withRefreshApiCall
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
