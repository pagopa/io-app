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
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      walletPaymentCreateTransaction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }

  const calculateFeesRequest = newTransaction({
    body: action.payload,
    eCommerceSessionToken: sessionToken
  });

  try {
    const calculateFeesResult = (yield* call(
      withRefreshApiCall,
      calculateFeesRequest,
      action
    )) as SagaCallReturnType<typeof newTransaction>;

    yield* put(
      pipe(
        calculateFeesResult,
        E.fold(
          error =>
            walletPaymentCreateTransaction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              action.payload.onSucces?.();
              return walletPaymentCreateTransaction.success(value);
            } else if (status === 400) {
              return walletPaymentCreateTransaction.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            } else {
              return walletPaymentCreateTransaction.failure(value);
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      walletPaymentCreateTransaction.failure({ ...getNetworkError(e) })
    );
  }
}
