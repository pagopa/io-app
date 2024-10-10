import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetRecentPaymentMethodUsedAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetRecentMethod(
  getUserLastPaymentMethod: PaymentClient["getUserLastPaymentMethodUsed"],
  action: ActionType<
    (typeof paymentsGetRecentPaymentMethodUsedAction)["request"]
  >
) {
  try {
    const getAllPaymentMethodsResult = yield* withPaymentsSessionToken(
      getUserLastPaymentMethod,
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getAllPaymentMethodsResult)) {
      yield* put(
        paymentsGetRecentPaymentMethodUsedAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getAllPaymentMethodsResult.left))
          )
        })
      );
      return;
    }
    const res = getAllPaymentMethodsResult.right;
    if (res.status === 200) {
      yield* put(paymentsGetRecentPaymentMethodUsedAction.success(res.value));
    } else if (res.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsGetRecentPaymentMethodUsedAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetRecentPaymentMethodUsedAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
