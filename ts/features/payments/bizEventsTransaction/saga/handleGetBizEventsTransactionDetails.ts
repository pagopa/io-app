import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getPaymentsBizEventsTransactionDetailsAction } from "../store/actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { TransactionClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { SagaCallReturnType } from "../../../../types/utils";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { paymentsResetPagoPaPlatformSessionTokenAction } from "../../common/store/actions";

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
  const getTransactionDetailsRequest = yield* withPaymentsSessionToken(
    getTransactionDetails,
    getPaymentsBizEventsTransactionDetailsAction.failure,
    {
      "transaction-id": action.payload.transactionId
    },
    "Authorization"
  );

  if (!getTransactionDetailsRequest) {
    return;
  }

  try {
    const getTransactionDetailsResult = (yield* call(
      withRefreshApiCall,
      getTransactionDetailsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionDetails>;

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
    } else if (getTransactionDetailsResult.right.status === 401) {
      // The 401 status returned from all the pagoPA APIs need to reset the session token before refreshing the token
      yield* put(paymentsResetPagoPaPlatformSessionTokenAction());
    } else {
      // The 401 status is handled by the withRefreshApiCall
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
