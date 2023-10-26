import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { walletStartOnboarding } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletClient } from "../../common/api/client";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";

/**
 * Handle the remote call to start Wallet onboarding
 * @param startOnboarding
 * @param action
 */
export function* handleStartWalletOnboarding(
  startOnboarding: WalletClient["createWallet"],
  token: string,
  action: ActionType<(typeof walletStartOnboarding)["request"]>
) {
  try {
    const { paymentMethodId } = action.payload;
    const startOnboardingResult: SagaCallReturnType<typeof startOnboarding> =
      yield* call(startOnboarding, {
        bearerAuth: token,
        body: {
          services: [ServiceNameEnum.PAGOPA],
          useDiagnosticTracing: true,
          paymentMethodId
        }
      });
    if (E.isRight(startOnboardingResult)) {
      if (startOnboardingResult.right.status === 201) {
        // handled success
        yield* put(
          walletStartOnboarding.success(startOnboardingResult.right.value)
        );
        return;
      }
      // not handled error codes
      yield* put(
        walletStartOnboarding.failure({
          ...getGenericError(
            new Error(
              `response status code ${startOnboardingResult.right.status}`
            )
          )
        })
      );
    } else {
      // cannot decode response
      yield* put(
        walletStartOnboarding.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(startOnboardingResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(walletStartOnboarding.failure({ ...getNetworkError(e) }));
  }
}
