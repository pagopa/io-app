import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetPaymentDetailsAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetDetails(
  getPaymentRequestInfo: PaymentClient["getPaymentRequestInfoForIO"],
  action: ActionType<(typeof paymentsGetPaymentDetailsAction)["request"]>
) {
  try {
    const getPaymentRequestInfoResult = yield* withPaymentsSessionToken(
      getPaymentRequestInfo,
      action,
      {
        rpt_id: action.payload
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getPaymentRequestInfoResult)) {
      yield* put(
        paymentsGetPaymentDetailsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getPaymentRequestInfoResult.left))
          )
        })
      );
      return;
    }
    const res = getPaymentRequestInfoResult.right;
    if (res.status === 200) {
      yield* put(paymentsGetPaymentDetailsAction.success(res.value));
    } else if (res.status === 400) {
      // Handling unhandled error from third-party services (GEC) during payment verification.
      // This is not an internal backend error from pagoPA, but rather a third-party service error and should be handled differently.
      yield* put(
        paymentsGetPaymentDetailsAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    } else if (res.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(paymentsGetPaymentDetailsAction.failure(res.value));
    }
  } catch (e) {
    yield* put(
      paymentsGetPaymentDetailsAction.failure({ ...getNetworkError(e) })
    );
  }
}
