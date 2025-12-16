import * as E from "fp-ts/lib/Either";
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
      {
        amount: action.payload.amount
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getAllPaymentMethodsResult)) {
      yield* put(
        paymentsGetPaymentMethodsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getAllPaymentMethodsResult.left))
          )
        })
      );
      return;
    }
    const res = getAllPaymentMethodsResult.right;
    if (res.status === 200) {
      yield* put(paymentsGetPaymentMethodsAction.success(res.value));
    } else if (res.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsGetPaymentMethodsAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetPaymentMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
