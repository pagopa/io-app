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
  navigateToActivateBpdOnNewSatispay,
  navigateToOnboardingSatispayStart
} from "../../navigation/action";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "../../navigation/routes";
import {
  walletAddSatispayBack,
  walletAddSatispayCancel,
  walletAddSatispayCompleted,
  walletAddSatispayFailure
} from "../../store/actions";
import { onboardingSatispayAddedResultSelector } from "../../store/reducers/addedSatispay";

/**
 * Define the workflow that allows the user to add a satispay to the wallet.
 * The workflow ends when:
 * - The user add the satispay account to the wallet {@link walletAddSatispayCompleted}
 * - The user abort the insertion  {@link walletAddSatispayCancel}
 * - The user choose back from the first screen {@link walletAddSatispayBack}
 */
function* satispayWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingSatispayStart,
    startScreenName: WALLET_ONBOARDING_SATISPAY_ROUTES.START,
    complete: walletAddSatispayCompleted,
    back: walletAddSatispayBack,
    cancel: walletAddSatispayCancel,
    failure: walletAddSatispayFailure
  });
}

/**
 * Chain the add satispay to wallet with "activate bpd on the new satispay"
 */
export function* addSatispayToWalletAndActivateBpd() {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);
  const res = yield* call<WorkUnitHandler>(
    withResetNavigationStack,
    satispayWorkUnit
  );

  const isInitialScreenDigitalPayment =
    initialScreenName === ROUTES.WALLET_ADD_PAYMENT_METHOD;

  if (res !== "back" && isInitialScreenDigitalPayment) {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit (hope soon!)
    yield* call(navigateToWalletHome);
  }
  if (res === "completed") {
    // refresh wallets list
    yield* put(fetchWalletsRequest());
    // read the new added satispay
    const satispayAdded: ReturnType<
      typeof onboardingSatispayAddedResultSelector
    > = yield* select(onboardingSatispayAddedResultSelector);

    if (satispayAdded) {
      yield* call(
        activateBpdOnNewPaymentMethods,
        [satispayAdded],
        navigateToActivateBpdOnNewSatispay
      );
    }
  }
}
