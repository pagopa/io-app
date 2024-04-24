import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsDeleteTransactionAction } from "../../store/actions/networking";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentDeleteTransaction(
  requestTransactionUserCancellation: PaymentClient["requestTransactionUserCancellation"],
  action: ActionType<(typeof paymentsDeleteTransactionAction)["request"]>
) {
  try {
    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        paymentsDeleteTransactionAction.failure({
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

    if (E.isLeft(requestTransactionUserCancellationResult)) {
      yield* put(
        paymentsDeleteTransactionAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(requestTransactionUserCancellationResult.left))
          )
        })
      );
      return;
    }

    if (requestTransactionUserCancellationResult.right.status === 202) {
      yield* put(paymentsDeleteTransactionAction.success());
    } else if (requestTransactionUserCancellationResult.right.status !== 401) {
      yield* put(
        paymentsDeleteTransactionAction.failure({
          ...getGenericError(new Error(`Error: ${requestTransactionUserCancellationResult.right.status}`))
        })
      );
    }

  } catch (e) {
    yield* put(
      paymentsDeleteTransactionAction.failure({ ...getNetworkError(e) })
    );
  }
}
