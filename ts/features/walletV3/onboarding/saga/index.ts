import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { WalletClient } from "../../common/api/client";
import { walletStartOnboarding } from "../store/actions";
import { handleStartWalletOnboarding } from "./handleStartWalletOnboarding";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchWalletOnboardingSaga(
  walletClient: WalletClient,
  token: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  // handle the request of starting wallet onboarding
  yield* takeLatest(
    walletStartOnboarding.request,
    handleStartWalletOnboarding,
    walletClient.checkPrerequisites,
    token,
    preferredLanguage
  );
}
