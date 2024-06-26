import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCreateTransactionAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransactionForIO"],
  action: ActionType<(typeof paymentsCreateTransactionAction)["request"]>
) {
  try {
    const newTransactionResult = yield* withPaymentsSessionToken(
      newTransaction,
      paymentsCreateTransactionAction.failure,
      action,
      {
        body: action.payload
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(newTransactionResult)) {
      if (action.payload.onError) {
        action.payload.onError();
      } else {
        yield* put(
          paymentsCreateTransactionAction.failure({
            ...getGenericError(
              new Error(readablePrivacyReport(newTransactionResult.left))
            )
          })
        );
      }
      return;
    }
    const status = newTransactionResult.right.status;
    if (status === 200) {
      yield* put(
        paymentsCreateTransactionAction.success(
          newTransactionResult.right.value
        )
      );
    } else if (status === 400) {
      if (action.payload.onError) {
        action.payload.onError();
      } else {
        yield* put(
          paymentsCreateTransactionAction.failure({
            ...getGenericError(new Error(`Error: ${status}`))
          })
        );
      }
    } else {
      yield* put(
        paymentsCreateTransactionAction.failure(
          newTransactionResult.right.value
        )
      );
    }
  } catch (e) {
    yield* put(
      paymentsCreateTransactionAction.failure({ ...getNetworkError(e) })
    );
  }
}
