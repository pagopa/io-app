import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsGetContextualOnboardingUrlAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentGetContextualOnboardingUrl(
  getContextualOnboardingUrl: PaymentClient["getMethodRedirectUrl"],
  action: ActionType<
    (typeof paymentsGetContextualOnboardingUrlAction)["request"]
  >
) {
  try {
    const getPaymentRequestInfoResult = yield* withPaymentsSessionToken(
      getContextualOnboardingUrl,
      action,
      {
        id: action.payload.paymentMethodId,
        rpt_id: action.payload.rptId,
        amount: action.payload.amount
      },
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getPaymentRequestInfoResult)) {
      yield* put(
        paymentsGetContextualOnboardingUrlAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getPaymentRequestInfoResult.left))
          )
        })
      );
      return;
    }
    const res = getPaymentRequestInfoResult.right;
    if (res.status === 200) {
      if (res.value?.redirectUrl) {
        action.payload.onSuccess?.(res.value?.redirectUrl);
      }
      yield* put(paymentsGetContextualOnboardingUrlAction.success(res.value));
    } else if (res.status !== 401) {
      // Handling unhandled error from third-party services (GEC) during payment verification.
      // This is not an internal backend error from pagoPA, but rather a third-party service error and should be handled differently.
      yield* put(
        paymentsGetContextualOnboardingUrlAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsGetContextualOnboardingUrlAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
