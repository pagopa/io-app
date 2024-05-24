import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsBizEventsReceiptAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { getOrFetchWalletSessionToken } from "../../checkout/saga/networking/handleWalletPaymentNewSessionToken";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { SagaCallReturnType } from "../../../../types/utils";

/**
 * Handle the remote call to get the transaction receipt pdf from the biz events API
 @param getPaymentMethods
 * @param action
 */
export function* handleGetBizEventsTransactionReceipt(
  getTransactionReceipt: TransactionClient["getPDFReceipt"],
  action: ActionType<(typeof getPaymentsBizEventsReceiptAction)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      getPaymentsBizEventsReceiptAction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }
  const getTransactionReceiptRequest = getTransactionReceipt({
    Authorization: sessionToken,
    "event-id": action.payload.transactionId
  });

  try {
    const getTransactionReceiptResult = (yield* call(
      withRefreshApiCall,
      getTransactionReceiptRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionReceipt>;

    if (E.isLeft(getTransactionReceiptResult)) {
      yield* put(
        getPaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionReceiptResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionReceiptResult.right.status === 200) {
      action.payload.onSuccess?.();
      yield* put(
        getPaymentsBizEventsReceiptAction.success(
          getTransactionReceiptResult.right.value as any
        )
      );
    } else if (getTransactionReceiptResult.right.status !== 401) {
      // The 401 status is handled by the withRefreshApiCall
      action.payload.onError?.();
      yield* put(
        getPaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionReceiptResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    action.payload.onError?.();
    yield* put(
      getPaymentsBizEventsReceiptAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
