import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentMethodsAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetAllMethods(
  getAllPaymentMethods: PaymentClient["getAllPaymentMethodsForIO"],
  action: ActionType<(typeof paymentsGetPaymentMethodsAction)["request"]>
) {
  const getAllPaymentMethodsRequest = yield* withPaymentsSessionToken(
    getAllPaymentMethods,
    paymentsGetPaymentMethodsAction.failure,
    {},
    "pagoPAPlatformSessionToken"
  );

  try {
    const getAllPaymentMethodsResult = (yield* call(
      withRefreshApiCall,
      getAllPaymentMethodsRequest,
      action
    )) as SagaCallReturnType<typeof getAllPaymentMethods>;

    yield* put(
      pipe(
        getAllPaymentMethodsResult,
        E.fold(
          error =>
            paymentsGetPaymentMethodsAction.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return paymentsGetPaymentMethodsAction.success(res.value);
            }
            return paymentsGetPaymentMethodsAction.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
      )
    );
  } catch (e) {
    yield* put(
      paymentsGetPaymentMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
