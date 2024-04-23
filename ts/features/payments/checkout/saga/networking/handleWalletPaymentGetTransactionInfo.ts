import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentTransactionInfoAction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetTransactionInfo(
  getTransactionInfo: PaymentClient["getTransactionInfo"],
  action: ActionType<
    (typeof paymentsGetPaymentTransactionInfoAction)["request"]
  >
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      paymentsGetPaymentTransactionInfoAction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }

  const getTransactionInfoRequest = getTransactionInfo({
    eCommerceSessionToken: sessionToken,
    transactionId: action.payload.transactionId
  });

  try {
    const getTransactionInfoResult = (yield* call(
      withRefreshApiCall,
      getTransactionInfoRequest,
      action
    )) as SagaCallReturnType<typeof getTransactionInfo>;

    if (E.isLeft(getTransactionInfoResult)) {
      yield* put(
        paymentsGetPaymentTransactionInfoAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionInfoResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionInfoResult.right.status === 200) {
      yield* put(
        paymentsGetPaymentTransactionInfoAction.success(
          getTransactionInfoResult.right.value
        )
      );
    } else if (getTransactionInfoResult.right.status !== 401) {
      yield* put(
        paymentsGetPaymentTransactionInfoAction.failure({
          ...getGenericError(new Error(JSON.stringify(getTransactionInfoResult.right.value)))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetPaymentTransactionInfoAction.failure({ ...getNetworkError(e) })
    );
  }
}
