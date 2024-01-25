import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentGetTransactionInfo } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentGetTransactionInfo(
  getTransactionInfo: PaymentClient["getTransactionInfo"],
  action: ActionType<(typeof walletPaymentGetTransactionInfo)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      walletPaymentGetTransactionInfo.failure({
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
    )) as unknown as SagaCallReturnType<typeof getTransactionInfo>;

    yield* put(
      pipe(
        getTransactionInfoResult,
        E.fold(
          error =>
            walletPaymentGetTransactionInfo.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              return walletPaymentGetTransactionInfo.success(value);
            } else {
              return walletPaymentGetTransactionInfo.failure({
                ...getGenericError(new Error(JSON.stringify(value)))
              });
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentGetTransactionInfo.failure({ ...getNetworkError(e) })
    );
  }
}
