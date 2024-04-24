import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { paymentsStartOnboardingAction } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";

/**
 * Handle the remote call to start Wallet onboarding
 * @param startOnboarding
 * @param action
 */
export function* handleStartWalletOnboarding(
  startOnboarding: WalletClient["createWallet"],
  action: ActionType<(typeof paymentsStartOnboardingAction)["request"]>
) {
  try {
    const { paymentMethodId } = action.payload;
    const startOnboardingRequest = startOnboarding({
      body: {
        applications: ["PAGOPA"],
        useDiagnosticTracing: true,
        paymentMethodId
      }
    });
    const startOnboardingResult = (yield* call(
      withRefreshApiCall,
      startOnboardingRequest,
      action
    )) as unknown as SagaCallReturnType<typeof startOnboarding>;
    if (E.isLeft(startOnboardingResult)) {
      yield* put(
        paymentsStartOnboardingAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(startOnboardingResult.left))
          )
        })
      );
      return;
    }
    if (startOnboardingResult.right.status === 201) {
      yield* put(
        paymentsStartOnboardingAction.success(startOnboardingResult.right.value)
      );
      return;
    } else if (startOnboardingResult.right.status !== 401) {
      // The 401 status is handled by the withRefreshApiCall
      yield* put(
        paymentsStartOnboardingAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${startOnboardingResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsStartOnboardingAction.failure({ ...getNetworkError(e) })
    );
  }
}
