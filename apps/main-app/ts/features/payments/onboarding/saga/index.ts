import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";

import { WalletClient } from "../../common/api/client";
import {
  paymentsOnboardingGetMethodsAction,
  paymentsStartOnboardingAction
} from "../store/actions";
import { handleStartWalletOnboarding } from "./handleStartWalletOnboarding";
import { handleGetPaymentMethods } from "./handleGetPaymentMethods";

/**
 * Handle Wallet onboarding requests
 * @param bearerToken
 */
export function* watchPaymentsOnboardingSaga(
  walletClient: WalletClient
): SagaIterator {
  // handle the request of starting wallet onboarding
  yield* takeLatest(
    paymentsStartOnboardingAction.request,
    handleStartWalletOnboarding,
    walletClient.createIOPaymentWallet
  );

  // handle the request of get list of payment methods available into onboarding
  yield* takeLatest(
    paymentsOnboardingGetMethodsAction.request,
    handleGetPaymentMethods,
    walletClient.getAllPaymentMethodsForIO
  );
}
