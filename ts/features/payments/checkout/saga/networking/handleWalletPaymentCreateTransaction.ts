import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCreateTransactionAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";
import { readablePrivacyReport } from "../../../../../utils/reporters";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransactionForIO"],
  action: ActionType<(typeof paymentsCreateTransactionAction)["request"]>
) {
  try {
    const newTransactionResult = yield* withPaymentsSessionToken(
      newTransaction,
      action,
      {
        body: action.payload.data
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(newTransactionResult)) {
      yield* put(
        paymentsCreateTransactionAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(newTransactionResult.left))
          )
        })
      );
    } else {
      const status = newTransactionResult.right.status;
      if (status === 200) {
        yield* put(
          paymentsCreateTransactionAction.success(
            newTransactionResult.right.value
          )
        );
        return;
      }
      if (status === 400) {
        // Handling unhandled error from third-party services (GEC) during payment verification.
        // This is not an internal backend error from pagoPA, but rather a third-party service error and should be handled differently.
        yield* put(
          paymentsCreateTransactionAction.failure({
            ...getGenericError(
              new Error(`Error: ${newTransactionResult.right.status}`)
            )
          })
        );
      } else if (status !== 401) {
        // The 401 status is handled by the withPaymentsSessionToken
        yield* put(
          paymentsCreateTransactionAction.failure(
            newTransactionResult.right.value
          )
        );
      }
      action.payload.onError?.();
    }
  } catch (e) {
    yield* put(
      paymentsCreateTransactionAction.failure({ ...getNetworkError(e) })
    );
  } finally {
    action.payload.onError?.();
  }
}
