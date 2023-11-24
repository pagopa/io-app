import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { WalletClient } from "../../common/api/client";
import {
  walletGetPaymentMethods,
  walletStartOnboarding
} from "../store/actions";
import { handleStartWalletOnboarding } from "./handleStartWalletOnboarding";
import { handleGetPaymentMethods } from "./handleGetPaymentMethods";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchWalletOnboardingSaga(
  walletClient: WalletClient
): SagaIterator {
  // handle the request of starting wallet onboarding
  yield* takeLatest(
    walletStartOnboarding.request,
    handleStartWalletOnboarding,
    walletClient.createWallet
  );

  // handle the request of get list of payment methods available into onboarding
  yield* takeLatest(
    walletGetPaymentMethods.request,
    handleGetPaymentMethods,
    walletClient.getAllPaymentMethods
  );
}
