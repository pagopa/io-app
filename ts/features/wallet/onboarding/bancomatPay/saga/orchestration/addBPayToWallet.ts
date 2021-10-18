import { NavigationActions } from "react-navigation";
import { call, put, select } from "redux-saga/effects";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
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
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingBPaySearchStartScreen(),
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
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    bPayWorkUnit
  );
  if (res !== "back") {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_DIGITAL_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit
    const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
      yield select(navigationCurrentRouteSelector);

    if (
      currentRoute.isSome() &&
      currentRoute.value === "WALLET_ADD_DIGITAL_PAYMENT_METHOD"
    ) {
      yield put(NavigationActions.back());
      yield put(NavigationActions.back());
    }
  }

  if (res === "completed") {
    // refresh wallets list
    yield put(fetchWalletsRequest());
    // read the new added BPay
    const bPayAdded: ReturnType<typeof onboardingBPayAddedAccountSelector> =
      yield select(onboardingBPayAddedAccountSelector);

    yield call(
      activateBpdOnNewPaymentMethods,
      bPayAdded,
      navigateToActivateBpdOnNewBPay()
    );
  }
}
