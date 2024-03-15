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
    )) as SagaCallReturnType<typeof getTransactionInfo>;

    yield* pipe(
      getTransactionInfoResult,
      E.fold(
        function* (error) {
          yield* put(
            walletPaymentGetTransactionInfo.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletPaymentGetTransactionInfo.success(value));
              break;
            case 401:
              //  This status code does not represent an error to show to the user
              // The authentication will be handled by the Fast Login token refresh procedure
              break;
            default:
              yield* put(
                walletPaymentGetTransactionInfo.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentGetTransactionInfo.failure({ ...getNetworkError(e) })
    );
  }
}
