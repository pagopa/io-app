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
      paymentsGetPaymentDetailsAction.failure,
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
    } else if (res.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      yield* put(
        paymentsGetPaymentDetailsAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetPaymentDetailsAction.failure({ ...getNetworkError(e) })
    );
  }
}
