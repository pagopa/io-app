import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsDeleteTransactionAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/saga/withPaymentsSessionToken";

export function* handleWalletPaymentDeleteTransaction(
  requestTransactionUserCancellation: PaymentClient["requestTransactionUserCancellationForIO"],
  action: ActionType<(typeof paymentsDeleteTransactionAction)["request"]>
) {
  try {
    const requestTransactionUserCancellationRequest =
      yield* withPaymentsSessionToken(
        requestTransactionUserCancellation,
        paymentsDeleteTransactionAction.failure,
        {
          transactionId: action.payload
        },
        "pagoPAPlatformSessionToken"
      );

    if (!requestTransactionUserCancellationRequest) {
      return;
    }

    const requestTransactionUserCancellationResult = (yield* call(
      withRefreshApiCall,
      requestTransactionUserCancellationRequest,
      action
    )) as SagaCallReturnType<typeof requestTransactionUserCancellation>;

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
      // The 401 status is handled by the withRefreshApiCall
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
