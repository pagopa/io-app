import { ActionType } from "typesafe-actions";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { paymentsOnboardingGetMethodsAction } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetPaymentMethods(
  getPaymentMethods: WalletClient["getAllPaymentMethods"],
  action: ActionType<(typeof paymentsOnboardingGetMethodsAction)["request"]>
) {
  const getPaymentMethodsRequest = getPaymentMethods({});
  try {
    const getPaymentMethodsResult = (yield* call(
      withRefreshApiCall,
      getPaymentMethodsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getPaymentMethods>;

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
      // The 401 status is handled by the withRefreshApiCall
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
