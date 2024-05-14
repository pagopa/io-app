import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { getOrFetchWalletSessionToken } from "../../checkout/saga/networking/handleWalletPaymentNewSessionToken";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

export function* handleGetTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<(typeof getPaymentsTransactionsAction)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      getPaymentsTransactionsAction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }

  const requestPayload: any = {
    size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
    Authorization: sessionToken,
    "x-continuation-token": action.payload.continuationToken
  };

  const getTransactionListRequest = getTransactionList(requestPayload);

  try {
    const getTransactionListResult = (yield* call(
      withRefreshApiCall,
      getTransactionListRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionList>;

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsTransactionsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionListResult.right.status === 200) {
      yield* put(
        getPaymentsTransactionsAction.success(
          getTransactionListResult.right.value as any
        )
      );
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsTransactionsAction.success([]));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status is handled by the withRefreshApiCall
      yield* put(
        getPaymentsTransactionsAction.failure({
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
      getPaymentsTransactionsAction.failure({ ...getNetworkError(e) })
    );
  }
}
