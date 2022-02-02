import { call, put, select } from "typed-redux-saga";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { activateBpdOnNewPaymentMethods } from "../../../../../bonus/bpd/saga/orchestration/activateBpdOnNewAddedPaymentMethods";
import {
  navigateToActivateBpdOnNewPrivative,
  navigateToOnboardingPrivativeChooseIssuerScreen
} from "../../navigation/action";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../navigation/routes";
import {
  walletAddPrivativeBack,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted,
  walletAddPrivativeFailure
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
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingPrivativeChooseIssuerScreen,
    startScreenName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER,
    complete: walletAddPrivativeCompleted,
    back: walletAddPrivativeBack,
    cancel: walletAddPrivativeCancel,
    failure: walletAddPrivativeFailure
  });
}

/**
 * Chain the add privative to wallet with "activate bpd on the new privative cards"
 */
export function* addPrivativeToWalletAndActivateBpd() {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);
  const sagaExecution = () =>
    withFailureHandling(() => withResetNavigationStack(privativeWorkUnit));

  const res: SagaCallReturnType<typeof executeWorkUnit> = yield* call(
    sagaExecution
  );

  const isInitialScreenAddPaymentMethod =
    initialScreenName === ROUTES.WALLET_ADD_PAYMENT_METHOD;

  if (res !== "back" && res !== "failure" && isInitialScreenAddPaymentMethod) {
    // integration with the legacy "Add a payment"
    // If the payment starts from "WALLET_ADD_PAYMENT_METHOD", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit.

    yield* call(navigateToWalletHome);
  }

  if (res === "completed") {
    // refresh wallets list
    yield* put(fetchWalletsRequest());
    // read the new added privative card
    const privativeAdded: ReturnType<typeof onboardingPrivativeAddedSelector> =
      yield* select(onboardingPrivativeAddedSelector);

    if (privativeAdded) {
      yield* call(
        activateBpdOnNewPaymentMethods,
        [privativeAdded],
        navigateToActivateBpdOnNewPrivative
      );
    }
  }
}
