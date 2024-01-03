import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { FaultCategoryEnum } from "../../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { GatewayFaultEnum } from "../../../../../../definitions/pagopa/ecommerce/GatewayFault";
import { SagaCallReturnType } from "../../../../../types/utils";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../api/client";
import { walletPaymentCreateTransaction } from "../../store/actions/networking";

export function* handleWalletPaymentCreateTransaction(
  newTransaction: PaymentClient["newTransaction"],
  action: ActionType<(typeof walletPaymentCreateTransaction)["request"]>
) {
  const calculateFeesRequest = newTransaction({
    body: action.payload
  });

  try {
    const calculateFeesResult = (yield* call(
      withRefreshApiCall,
      calculateFeesRequest,
      action
    )) as unknown as SagaCallReturnType<typeof newTransaction>;

    yield* put(
      pipe(
        calculateFeesResult,
        E.fold(
          () =>
            walletPaymentCreateTransaction.failure({
              faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
              faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
            }),

          ({ status, value }) => {
            if (status === 200) {
              return walletPaymentCreateTransaction.success(value);
            } else if (status === 400) {
              return walletPaymentCreateTransaction.failure({
                faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
                faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
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
      walletPaymentCreateTransaction.failure({
        faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
        faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
      })
    );
  }
}
