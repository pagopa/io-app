import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { CalculateFeeRequest } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeRequest";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentCalculateFees } from "../../store/actions/networking";

export function* handleWalletPaymentCalculateFees(
  calculateFees: PaymentClient["calculateFees"],
  action: ActionType<(typeof walletPaymentCalculateFees)["request"]>
) {
  const requestBody: CalculateFeeRequest = {
    paymentAmount: action.payload.paymentAmountInCents,
    walletId: action.payload.walletId
  };

  const calculateFeesRequest = calculateFees({
    id: action.payload.walletId,
    body: requestBody
  });

  try {
    const calculateFeesResult = (yield* call(
      withRefreshApiCall,
      calculateFeesRequest,
      action
    )) as unknown as SagaCallReturnType<typeof calculateFees>;

    yield* put(
      pipe(
        calculateFeesResult,
        E.fold(
          error =>
            walletPaymentCalculateFees.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return walletPaymentCalculateFees.success(res.value);
            }
            return walletPaymentCalculateFees.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(walletPaymentCalculateFees.failure({ ...getNetworkError(e) }));
  }
}
