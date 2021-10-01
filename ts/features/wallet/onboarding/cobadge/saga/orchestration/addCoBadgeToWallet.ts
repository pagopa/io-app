import { NavigationActions } from "react-navigation";
import { call, put, select } from "redux-saga/effects";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
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
import ROUTES from "../../../../../../navigation/routes";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";

/**
 * Define the workflow that allows the user to add a co-badge card to the wallet.
 * The workflow ends when:
 * - The user adds at least one owned co-badge card to the wallet {@link walletAddCoBadgeCompleted}
 * - The user aborts the insertion of a co-badge {@link walletAddCoBadgeCancel}
 * - The user chooses back from the first screen {@link walletAddCoBadgeBack}
 */
function* coBadgeWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingCoBadgeSearchStartScreen(),
    startScreenName: WALLET_ONBOARDING_COBADGE_ROUTES.START,
    complete: walletAddCoBadgeCompleted,
    back: walletAddCoBadgeBack,
    cancel: walletAddCoBadgeCancel,
    failure: walletAddCoBadgeFailure
  });
}

/**
 * Chain the add co-badge to wallet with "activate bpd on the new co-badge cards"
 */
export function* addCoBadgeToWalletAndActivateBpd() {
  const sagaExecution = () =>
    withFailureHandling(() => withResetNavigationStack(coBadgeWorkUnit));

  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    sagaExecution
  );

  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);
  if (res !== "back" && res !== "failure" && currentRoute.isSome()) {
    // If the addition starts from "WALLET_ONBOARDING_COBADGE_CHOOSE_TYPE", remove from stack
    // This shouldn't happens if all the workflow will use the executeWorkUnit

    if (currentRoute.value === ROUTES.WALLET_ADD_CARD) {
      yield put(navigationHistoryPop(1));
      yield put(NavigationActions.back());
    }

    if (currentRoute.value === "WALLET_ONBOARDING_COBADGE_CHOOSE_TYPE") {
      yield put(NavigationActions.back());
      const newRoute: ReturnType<typeof navigationCurrentRouteSelector> =
        yield select(navigationCurrentRouteSelector);
      if (
        res === "completed" &&
        newRoute.isSome() &&
        newRoute.value === ROUTES.WALLET_BANCOMAT_DETAIL
      ) {
        yield put(NavigationActions.back());
      }
    }
  }

  if (res === "completed") {
    // refresh wallets list
    yield put(fetchWalletsRequest());
    // read the new added co-badge cards
    const coBadgeAdded: ReturnType<typeof onboardingCoBadgeAddedSelector> =
      yield select(onboardingCoBadgeAddedSelector);

    yield call(
      activateBpdOnNewPaymentMethods,
      coBadgeAdded,
      navigateToActivateBpdOnNewCoBadge()
    );
  }
}
