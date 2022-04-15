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
  navigateToActivateBpdOnNewBancomat,
  navigateToOnboardingBancomatSearchStartScreen
} from "../../navigation/action";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "../../navigation/routes";
import {
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted,
  walletAddBancomatFailure
} from "../../store/actions";
import { onboardingBancomatAddedPansSelector } from "../../store/reducers/addedPans";

/**
 * Define the workflow that allows the user to add a bancomat to the wallet.
 * The workflow ends when:
 * - The user add at least one owned bancomat to the wallet {@link walletAddBancomatCompleted}
 * - The user abort the insertion of a bancomat {@link walletAddBancomatCancel}
 * - The user choose back from the first screen {@link walletAddBancomatBack}
 */
function* bancomatWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingBancomatSearchStartScreen,
    startScreenName: WALLET_ONBOARDING_BANCOMAT_ROUTES.BANCOMAT_START,
    complete: walletAddBancomatCompleted,
    back: walletAddBancomatBack,
    cancel: walletAddBancomatCancel,
    failure: walletAddBancomatFailure
  });
}

/**
 * Chain the add bancomat to wallet with "activate bpd on the new bancomat"
 */
export function* addBancomatToWalletAndActivateBpd() {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);

  const res = yield* call<WorkUnitHandler>(
    withResetNavigationStack,
    bancomatWorkUnit
  );

  if (
    res !== "back" &&
    initialScreenName === ROUTES.WALLET_ADD_PAYMENT_METHOD
  ) {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit

    yield* call(navigateToWalletHome);
  }

  if (res === "completed") {
    // refresh wallets list
    yield* put(fetchWalletsRequest());
    // read the new added bancomat
    const bancomatAdded: ReturnType<
      typeof onboardingBancomatAddedPansSelector
    > = yield* select(onboardingBancomatAddedPansSelector);
    yield* call(
      activateBpdOnNewPaymentMethods,
      bancomatAdded,
      navigateToActivateBpdOnNewBancomat
    );
  }
}
