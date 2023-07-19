// import { call, put } from "typed-redux-saga/macro";
// import * as E from "fp-ts/lib/Either";
// import { SagaCallReturnType } from "../../../../types/utils";
// import { walletStartOnboarding } from "../store/actions";
// import { readablePrivacyReport } from "../../../../utils/reporters";
// import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { WalletClient } from "../../common/api/client";

/**
 * Handle the remote call to start Wallet onboarding
 * @param startOnboarding
 * @param action
 */
export function* handleStartWalletOnboarding(
  startOnboarding: WalletClient["checkPrerequisites"], // TODO: change it to wallet onboarding client
  token: string,
  language: PreferredLanguageEnum
) {
  // try {
  //   const startOnboardingResult: SagaCallReturnType<typeof startOnboarding> =
  //     yield* call(startOnboarding, {
  //       bearerAuth: token,
  //       "Accept-Language": language
  //     });
  //   if (E.isRight(startOnboardingResult)) {
  //     if (startOnboardingResult.right.status === 200) {
  //       // handled success
  //       yield* put(
  //         walletStartOnboarding.success(startOnboardingResult.right.value)
  //       );
  //       return;
  //     }
  //     // not handled error codes
  //     yield* put(
  //       walletStartOnboarding.failure({
  //         ...getGenericError(
  //           new Error(
  //             `response status code ${startOnboardingResult.right.status}`
  //           )
  //         )
  //       })
  //     );
  //   } else {
  //     // cannot decode response
  //     yield* put(
  //       walletStartOnboarding.failure({
  //         ...getGenericError(
  //           new Error(readablePrivacyReport(startOnboardingResult.left))
  //         )
  //       })
  //     );
  //   }
  // } catch (e) {
  //   yield* put(walletStartOnboarding.failure({ ...getNetworkError(e) }));
  // }
}
