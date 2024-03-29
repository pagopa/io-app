import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCreateTransactionAction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransaction"],
  action: ActionType<(typeof paymentsCreateTransactionAction)["request"]>
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        paymentsCreateTransactionAction.failure({
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

    yield* put(
      pipe(
        newTransactionResult,
        E.fold(
          error =>
            paymentsCreateTransactionAction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),
          ({ status, value }) => {
            if (status === 200) {
              return paymentsCreateTransactionAction.success(value);
            } else if (status === 400) {
              return paymentsCreateTransactionAction.failure({
                ...getGenericError(new Error(`Error: ${status}`))
              });
            } else {
              return paymentsCreateTransactionAction.failure(value);
            }
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      paymentsCreateTransactionAction.failure({ ...getNetworkError(e) })
    );
  }
}
