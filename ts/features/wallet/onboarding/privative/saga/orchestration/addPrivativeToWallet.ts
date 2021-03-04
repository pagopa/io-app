import { call } from "redux-saga/effects";
import { executeWorkUnit } from "../../../../../../sagas/workUnit";
import {
  walletAddPrivativeBack,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted
} from "../../store/actions";

/**
 * Define the workflow that allows the user to add a co-badge card to the wallet.
 * The workflow ends when:
 * - The user adds at least one owned co-badge card to the wallet {@link walletAddCoBadgeCompleted}
 * - The user aborts the insertion of a co-badge {@link walletAddCoBadgeCancel}
 * - The user chooses back from the first screen {@link walletAddCoBadgeBack}
 */
function* privativeWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingCoBadgeSearchStartScreen(),
    startScreenName: WALLET_ONBOARDING_COBADGE_ROUTES.START,
    complete: walletAddPrivativeCompleted,
    back: walletAddPrivativeBack,
    cancel: walletAddPrivativeCancel
  });
}
