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
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransactionForIO"],
  action: ActionType<(typeof paymentsCreateTransactionAction)["request"]>
) {
  try {
    const newTransactionRequest = yield* withPaymentsSessionToken(
      newTransaction,
      paymentsCreateTransactionAction.failure,
      {
        body: action.payload
      },
      "pagoPAPlatformSessionToken"
    );

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
