import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentMethodsAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetAllMethods(
  getAllPaymentMethods: PaymentClient["getAllPaymentMethodsForIO"],
  action: ActionType<(typeof paymentsGetPaymentMethodsAction)["request"]>
) {
  try {
    const getAllPaymentMethodsResult = yield* withPaymentsSessionToken(
      getAllPaymentMethods,
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

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
