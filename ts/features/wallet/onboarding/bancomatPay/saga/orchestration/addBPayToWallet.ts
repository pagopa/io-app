import { call, put, select } from "typed-redux-saga/macro";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withResetNavigationStack,
  WorkUnitHandler
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { activateBpdOnNewPaymentMethods } from "../../../../../bonus/bpd/saga/orchestration/activateBpdOnNewAddedPaymentMethods";

import {
  navigateToActivateBpdOnNewBPay,
  navigateToOnboardingBPaySearchStartScreen
} from "../../navigation/action";
import WALLET_ONBOARDING_BPAY_ROUTES from "../../navigation/routes";
import {
  walletAddBPayBack,
  walletAddBPayCancel,
  walletAddBPayCompleted,
  walletAddBPayFailure
} from "../../store/actions";
import { onboardingBPayAddedAccountSelector } from "../../store/reducers/addedBPay";

/**
 * Define the workflow that allows the user to add BPay accounts to the wallet.
 * The workflow ends when:
 * - The user add at least one owned BPay to the wallet {@link walletAddBPayCompleted}
 * - The user abort the insertion of a BPay {@link walletAddBPayCancel}
 * - The user choose back from the first screen {@link walletAddBPayBack}
 */
function* bPayWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingBPaySearchStartScreen,
    startScreenName: WALLET_ONBOARDING_BPAY_ROUTES.START,
    complete: walletAddBPayCompleted,
    back: walletAddBPayBack,
    cancel: walletAddBPayCancel,
    failure: walletAddBPayFailure
  });
}

/**
 * Chain the add BPay to wallet with "activate bpd on the new BPay accounts"
 */
export function* addBPayToWalletAndActivateBpd() {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);
  const res = yield* call<WorkUnitHandler>(
    withResetNavigationStack,
    bPayWorkUnit
  );

  if (
    res !== "back" &&
    initialScreenName === ROUTES.WALLET_ADD_PAYMENT_METHOD
  ) {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_DIGITAL_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit

    yield* call(navigateToWalletHome);
  }

  if (res === "completed") {
    // refresh wallets list
    yield* put(fetchWalletsRequest());
    // read the new added BPay
    const bPayAdded: ReturnType<typeof onboardingBPayAddedAccountSelector> =
      yield* select(onboardingBPayAddedAccountSelector);

    yield* call(
      activateBpdOnNewPaymentMethods,
      bPayAdded,
      navigateToActivateBpdOnNewBPay
    );
  }
}
