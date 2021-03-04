import { call, put } from "redux-saga/effects";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToOnboardingPrivativeChooseBrandScreen } from "../../navigation/action";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../navigation/routes";
import {
  walletAddPrivativeBack,
  walletAddPrivativeCancel,
  walletAddPrivativeCompleted
} from "../../store/actions";

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
    startScreenName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_BRAND,
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
