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

    yield* put(
      pipe(
        requestTransactionUserCancellationResult,
        E.fold(
          error =>
            walletPaymentDeleteTransaction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 202) {
              return walletPaymentDeleteTransaction.success();
            }
            return walletPaymentDeleteTransaction.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentDeleteTransaction.failure({ ...getNetworkError(e) })
    );
  }
}
