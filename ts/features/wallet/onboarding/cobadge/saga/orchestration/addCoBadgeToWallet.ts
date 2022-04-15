import { call, put, select } from "typed-redux-saga/macro";
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
  navigateToActivateBpdOnNewCoBadge,
  navigateToOnboardingCoBadgeSearchStartScreen
} from "../../navigation/action";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../navigation/routes";
import {
  walletAddCoBadgeBack,
  walletAddCoBadgeCancel,
  walletAddCoBadgeCompleted,
  walletAddCoBadgeFailure
} from "../../store/actions";
import { onboardingCoBadgeAddedSelector } from "../../store/reducers/addedCoBadge";

/**
 * Define the workflow that allows the user to add a co-badge card to the wallet.
 * The workflow ends when:
 * - The user adds at least one owned co-badge card to the wallet {@link walletAddCoBadgeCompleted}
 * - The user aborts the insertion of a co-badge {@link walletAddCoBadgeCancel}
 * - The user chooses back from the first screen {@link walletAddCoBadgeBack}
 */
function* coBadgeWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingCoBadgeSearchStartScreen,
    startScreenName: WALLET_ONBOARDING_COBADGE_ROUTES.START,
    complete: walletAddCoBadgeCompleted,
    back: walletAddCoBadgeBack,
    cancel: walletAddCoBadgeCancel,
    failure: walletAddCoBadgeFailure
  });
}

/**
 * When the workUnit start from one of these route, we should return to wallet home
 */
const returnToWalletRoutes = new Set<string>([
  ROUTES.WALLET_ADD_CARD,
  WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE
]);

/**
 * Chain the add co-badge to wallet with "activate bpd on the new co-badge cards"
 */
export function* addCoBadgeToWalletAndActivateBpd() {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteName
  > = yield* call(NavigationService.getCurrentRouteName);
  const sagaExecution = () =>
    withFailureHandling(() => withResetNavigationStack(coBadgeWorkUnit));

  const res: SagaCallReturnType<typeof executeWorkUnit> = yield* call(
    sagaExecution
  );

  const shouldNavigateWalletHome =
    initialScreenName !== undefined &&
    returnToWalletRoutes.has(initialScreenName) &&
    res === "completed";

  if (shouldNavigateWalletHome) {
    // If the addition starts from "WALLET_ONBOARDING_COBADGE_CHOOSE_TYPE", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit

    yield* call(navigateToWalletHome);
  }

  if (res === "completed") {
    // refresh wallets list
    yield* put(fetchWalletsRequest());
    // read the new added co-badge cards
    const coBadgeAdded: ReturnType<typeof onboardingCoBadgeAddedSelector> =
      yield* select(onboardingCoBadgeAddedSelector);

    yield* call(
      activateBpdOnNewPaymentMethods,
      coBadgeAdded,
      navigateToActivateBpdOnNewCoBadge
    );
  }
}
