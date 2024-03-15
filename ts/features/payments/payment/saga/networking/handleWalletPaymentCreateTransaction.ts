import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentCreateTransaction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransaction"],
  action: ActionType<(typeof walletPaymentCreateTransaction)["request"]>
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        walletPaymentCreateTransaction.failure({
          ...getGenericError(new Error(`Missing session token`))
        })
      );
      return;
    }

    const newTransactionRequest = newTransaction({
      body: action.payload,
      eCommerceSessionToken: sessionToken
    });

    const newTransactionResult = (yield* call(
      withRefreshApiCall,
      newTransactionRequest,
      action
    )) as SagaCallReturnType<typeof newTransaction>;

    yield* pipe(
      newTransactionResult,
      E.fold(
        function* (error) {
          yield* put(
            walletPaymentCreateTransaction.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletPaymentCreateTransaction.success(value));
              break;
            case 400:
              yield* put(
                walletPaymentCreateTransaction.failure(
                  getGenericError(new Error(`Error: ${status}`))
                )
              );
              break;
            default:
              yield* put(walletPaymentCreateTransaction.failure(value));
          }
        }
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentCreateTransaction.failure({ ...getNetworkError(e) })
    );
  }
}
