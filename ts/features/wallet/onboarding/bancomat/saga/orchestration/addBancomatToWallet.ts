import { call, put, select } from "redux-saga/effects";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { isBpdEnabled } from "../../../../../bonus/bpd/saga/orchestration/onboarding/startOnboarding";
import { bpdOnboardingStart } from "../../../../../bonus/bpd/store/actions/onboarding";
import { navigateToOnboardingBancomatChooseBank } from "../../navigation/action";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "../../navigation/routes";
import {
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted
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
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingBancomatChooseBank(),
    startScreenName: WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK,
    complete: walletAddBancomatCompleted,
    back: walletAddBancomatBack,
    cancel: walletAddBancomatCancel
  });
}

/**
 * A saga that invokes the addition of a bancomat workflow {@link bancomatWorkUnit} and return
 * to the wallet after the insertion.
 */
export function* addBancomatToWalletGeneric() {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    bancomatWorkUnit
  );
  if (res !== "back") {
    yield put(navigateToWalletHome());
  }
}

export function* addBancomatToWalletAndActivateBpd() {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    bancomatWorkUnit
  );
  if (res === "cancel") {
    yield put(navigateToWalletHome());
  } else if (res === "completed") {
    const bancomatAdded: ReturnType<typeof onboardingBancomatAddedPansSelector> = yield select(
      onboardingBancomatAddedPansSelector
    );
    // TODO: change enableableFunction with types representing the possibles functionalities
    const atLeastOneBancomatWithBpdCapability = bancomatAdded.some(b =>
      b.enableableFunctions?.includes("BPDs")
    );

    // No bancomat with bpd capability added in the current workflow, return to wallet home
    if (!atLeastOneBancomatWithBpdCapability) {
      yield put(navigateToWalletHome());
    }
    const isBpdEnabledResponse: SagaCallReturnType<typeof isBpdEnabled> = yield call(
      isBpdEnabled
    );

    if (isBpdEnabledResponse.isLeft()) {
      yield put(navigateToWalletHome());
    } else {
      if (isBpdEnabledResponse.value) {
        // navigate to onboarding new bancomat
      } else {
        // navigate to "ask if u want to start bpd onboarding"
        yield put(bpdOnboardingStart());
      }
    }
  }
}
