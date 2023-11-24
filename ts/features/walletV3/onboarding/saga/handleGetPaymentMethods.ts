import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { walletGetPaymentMethods } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetPaymentMethods(
  getPaymentMethods: WalletClient["getAllPaymentMethods"]
) {
  try {
    const getPaymentMethodsResult: SagaCallReturnType<
      typeof getPaymentMethods
    > = yield* call(getPaymentMethods, {});
    if (E.isRight(getPaymentMethodsResult)) {
      if (getPaymentMethodsResult.right.status === 200) {
        // handled success
        yield* put(
          walletGetPaymentMethods.success(getPaymentMethodsResult.right.value)
        );
        return;
      }
      // not handled error codes
      yield* put(
        walletGetPaymentMethods.failure({
          ...getGenericError(
            new Error(
              `response status code ${getPaymentMethodsResult.right.status}`
            )
          )
        })
      );
    } else {
      // cannot decode response
      yield* put(
        walletGetPaymentMethods.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getPaymentMethodsResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(walletGetPaymentMethods.failure({ ...getNetworkError(e) }));
  }
}
