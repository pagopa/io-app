import { SagaIterator } from "redux-saga";
import { all, call, select, take } from "typed-redux-saga/macro";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { isIdPayEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../store/reducers/types";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";

/**
 * Saga that handles the Mixpanel properties update based on the wallet screen content.
 * It waits for all wallet-related API calls to complete before updating analytics.
 */
export function* handleWalletAnalyticsSaga() {
  const isIdPayEnabled = yield* select(isIdPayEnabledSelector);

  // Prerequisites for the analytics update
  const analyticsPrerequisites = [
    waitForPaymentMethods,
    waitForCgnDetails,
    ...(isIdPayEnabled ? [waitForIdPay] : [])
  ];

  // Call and wait for all prerequisite sagas to complete
  yield* all(analyticsPrerequisites.map(call));

  // Update analytics
  const state: GlobalState = yield* select();
  void updateMixpanelProfileProperties(state);
  void updateMixpanelSuperProperties(state);
}

/**
 * Wait for payment methods request to complete (success or failure)
 */
function* waitForPaymentMethods(): SagaIterator {
  yield* take([
    getPaymentsWalletUserMethods.success,
    getPaymentsWalletUserMethods.failure
  ]);
}

/**
 * Wait for IDPay wallet request to complete (success or failure)
 */
function* waitForIdPay(): SagaIterator {
  yield* take([idPayWalletGet.success, idPayWalletGet.failure]);
}

/**
 * Wait for CGN details request to complete (success or failure)
 */
function* waitForCgnDetails(): SagaIterator {
  yield* take([cgnDetails.success, cgnDetails.failure]);
}
