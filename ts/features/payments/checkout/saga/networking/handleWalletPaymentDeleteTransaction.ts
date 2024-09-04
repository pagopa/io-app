import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsDeleteTransactionAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentDeleteTransaction(
  requestTransactionUserCancellation: PaymentClient["requestTransactionUserCancellationForIO"],
  action: ActionType<(typeof paymentsDeleteTransactionAction)["request"]>
) {
  try {
    const requestTransactionUserCancellationResult =
      yield* withPaymentsSessionToken(
        requestTransactionUserCancellation,
        action,
        {
          transactionId: action.payload
        },
        "pagoPAPlatformSessionToken"
      );

    if (E.isLeft(requestTransactionUserCancellationResult)) {
      yield* put(
        paymentsDeleteTransactionAction.failure({
          ...getGenericError(
            new Error(
              readablePrivacyReport(
                requestTransactionUserCancellationResult.left
              )
            )
          )
        })
      );
      return;
    }

    if (requestTransactionUserCancellationResult.right.status === 202) {
      yield* put(paymentsDeleteTransactionAction.success());
    } else if (requestTransactionUserCancellationResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsDeleteTransactionAction.failure({
          ...getGenericError(
            new Error(
              `Error: ${requestTransactionUserCancellationResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsDeleteTransactionAction.failure({ ...getNetworkError(e) })
    );
  }
}
