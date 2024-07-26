import { ActionType } from "typesafe-actions";
import { put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { paymentsOnboardingGetMethodsAction } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetPaymentMethods(
  getPaymentMethods: WalletClient["getAllPaymentMethodsForIO"],
  action: ActionType<(typeof paymentsOnboardingGetMethodsAction)["request"]>
) {
  try {
    const getPaymentMethodsResult = yield* withPaymentsSessionToken(
      getPaymentMethods,
      action,
      {},
      "pagoPAPlatformSessionToken"
    );

    if (E.isLeft(getPaymentMethodsResult)) {
      yield* put(
        paymentsOnboardingGetMethodsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getPaymentMethodsResult.left))
          )
        })
      );
      return;
    }

    if (getPaymentMethodsResult.right.status === 200) {
      yield* put(
        paymentsOnboardingGetMethodsAction.success(
          getPaymentMethodsResult.right.value
        )
      );
    } else if (getPaymentMethodsResult.right.status !== 401) {
      // The 401 status is handled by the withpaymentsSessionToken
      yield* put(
        paymentsOnboardingGetMethodsAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getPaymentMethodsResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsOnboardingGetMethodsAction.failure({ ...getNetworkError(e) })
    );
  }
}
