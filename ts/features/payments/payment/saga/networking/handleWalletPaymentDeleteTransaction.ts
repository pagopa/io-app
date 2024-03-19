import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentDeleteTransaction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentDeleteTransaction(
  requestTransactionUserCancellation: PaymentClient["requestTransactionUserCancellation"],
  action: ActionType<(typeof walletPaymentDeleteTransaction)["request"]>
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        walletPaymentDeleteTransaction.failure({
          ...getGenericError(new Error(`Missing session token`))
        })
      );
      return;
    }

    const requestTransactionUserCancellationRequest =
      requestTransactionUserCancellation({
        transactionId: action.payload,
        eCommerceSessionToken: sessionToken
      });

    const requestTransactionUserCancellationResult = (yield* call(
      withRefreshApiCall,
      requestTransactionUserCancellationRequest,
      action
    )) as SagaCallReturnType<typeof requestTransactionUserCancellation>;

    yield* pipe(
      requestTransactionUserCancellationResult,
      E.fold(
        function* (error) {
          yield* put(
            walletPaymentDeleteTransaction.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status }) {
          switch (status) {
            case 202:
              yield* put(walletPaymentDeleteTransaction.success());
              break;
            case 401:
              //  This status code does not represent an error to show to the user
              // The authentication will be handled by the Fast Login token refresh procedure
              break;
            default:
              yield* put(
                walletPaymentDeleteTransaction.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentDeleteTransaction.failure({ ...getNetworkError(e) })
    );
  }
}
