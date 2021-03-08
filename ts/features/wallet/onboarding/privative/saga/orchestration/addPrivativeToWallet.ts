import { NavigationActions } from "react-navigation";
import { call, put, select } from "redux-saga/effects";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { activateBpdOnNewPaymentMethods } from "../../../../../bonus/bpd/saga/orchestration/activateBpdOnNewAddedPaymentMethods";
import {
  navigateToActivateBpdOnNewPrivative,
  navigateToOnboardingPrivativeChooseBrandScreen
} from "../../navigation/action";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../navigation/routes";
import {
  walletAddPrivativeBack,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted
} from "../../store/actions";
import { onboardingPrivativeAddedSelector } from "../../store/reducers/addedPrivative";

/**
 * Define the workflow that allows the user to add a privative card to the wallet.
 * The workflow ends when:
 * - The user adds at least one owned privative card to the wallet {@link walletAddCoBadgeCompleted}
 * - The user aborts the insertion of a privative card {@link walletAddCoBadgeCancel}
 * - The user chooses back from the first screen {@link walletAddCoBadgeBack}
 */
function* privativeWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingPrivativeChooseBrandScreen(),
    startScreenName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER,
    complete: walletAddPrivativeCompleted,
    back: walletAddPrivativeBack,
    cancel: walletAddPrivativeCancel
  });
}

/**
 * A saga that invokes the addition of a privative card workflow {@link privativeWorkUnit} and returns
 * to the wallet after the insertion.
 */
export function* addPrivativeToWalletGeneric() {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    privativeWorkUnit
  );
  if (res !== "back") {
    yield put(navigateToWalletHome());
  }
}

/**
 * Chain the add privative to wallet with "activate bpd on the new privative cards"
 */
export function* addPrivativeToWalletAndActivateBpd() {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    privativeWorkUnit
  );
  if (res !== "back") {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit.
    const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
      navigationCurrentRouteSelector
    );

    if (
      currentRoute.isSome() &&
      currentRoute.value === ROUTES.WALLET_ADD_PAYMENT_METHOD
    ) {
      yield put(NavigationActions.back());
    }
  }

  if (res === "completed") {
    // refresh wallets list
    yield put(fetchWalletsRequest());
    // read the new added privative card
    const privativeAdded: ReturnType<typeof onboardingPrivativeAddedSelector> = yield select(
      onboardingPrivativeAddedSelector
    );

    if (privativeAdded) {
      yield call(
        activateBpdOnNewPaymentMethods,
        [privativeAdded],
        navigateToActivateBpdOnNewPrivative()
      );
    }
  }
}
