import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import {
  navigateBack,
  navigateToWalletHome
} from "../../../../../store/actions/navigation";
import { paymentMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue
} from "../../store/actions/iban";
import { bpdOnboardingCompleted } from "../../store/actions/onboarding";
import { isBpdOnboardingOngoing } from "../../store/reducers/onboarding/ongoing";

// TODO: if isOnboarding===true, change with an action that triggers a saga that choose
//  which screen to display, (the user already have payment methods or not)

/**
 * Old style orchestrator, please don't use this as reference for future development
 * @deprecated
 */
export function* bpdIbanInsertionWorker() {
  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> =
    yield* select(isBpdOnboardingOngoing);
  // ensure the first screen of the saga is the iban main screen.

  // wait for the user iban insertion o cancellation
  const nextAction = yield* take<
    ActionType<typeof bpdIbanInsertionCancel | typeof bpdIbanInsertionContinue>
  >([bpdIbanInsertionCancel, bpdIbanInsertionContinue]);
  if (isActionOf(bpdIbanInsertionCancel, nextAction)) {
    yield* call(onboardingOngoing ? navigateToWalletHome : navigateBack);
  } else {
    if (onboardingOngoing) {
      const paymentMethods: ReturnType<typeof paymentMethodsSelector> =
        yield* select(paymentMethodsSelector);

      // Error while loading the wallet, display a message that informs the user about the error
      if (paymentMethods.kind === "PotNoneError") {
        yield* put(bpdOnboardingCompleted());
        return;
      }

      yield* put(bpdOnboardingCompleted());
    } else {
      yield* call(navigateBack);
    }
  }
}

/**
 * This saga start the workflow that allows the user to insert / modify the IBAN associated to bpd.
 * In this first phase subject to changes, the call to the bpdIbanInsertionWorker is preserved,
 * instead of removing the call.
 */
export function* handleBpdIbanInsertion(): SagaIterator {
  yield* call(bpdIbanInsertionWorker);
}
