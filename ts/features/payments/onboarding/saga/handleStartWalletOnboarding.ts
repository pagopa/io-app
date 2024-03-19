import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import { walletStartOnboarding } from "../store/actions";

/**
 * Handle the remote call to start Wallet onboarding
 * @param startOnboarding
 * @param action
 */
export function* handleStartWalletOnboarding(
  startOnboarding: WalletClient["createWallet"],
  action: ActionType<(typeof walletStartOnboarding)["request"]>
) {
  try {
    const { paymentMethodId } = action.payload;
    const startOnboardingRequest = startOnboarding({
      body: {
        services: [ServiceNameEnum.PAGOPA],
        useDiagnosticTracing: true,
        paymentMethodId
      }
    });
    const startOnboardingResult = (yield* call(
      withRefreshApiCall,
      startOnboardingRequest,
      action
    )) as SagaCallReturnType<typeof startOnboarding>;

    yield* pipe(
      startOnboardingResult,
      E.fold(
        function* (error) {
          yield* put(
            walletStartOnboarding.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 201:
              yield* put(walletStartOnboarding.success(value));
              break;
            default:
              yield* put(
                walletStartOnboarding.failure(
                  getGenericError(new Error(`response status code ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletStartOnboarding.failure({ ...getNetworkError(e) }));
  }
}
