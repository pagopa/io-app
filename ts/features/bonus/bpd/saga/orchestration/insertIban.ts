import { NavigationActions } from "@react-navigation/compat";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
import NavigationService from "../../../../../navigation/NavigationService";
import {
  navigateBack,
  navigateToWalletHome
} from "../../../../../store/actions/navigation";
import { paymentMethodsSelector } from "../../../../../store/reducers/wallet/wallets";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import {
  navigateToBpdIbanInsertion,
  navigateToBpdOnboardingEnrollPaymentMethod,
  navigateToBpdOnboardingErrorPaymentMethods,
  navigateToBpdOnboardingNoPaymentMethods
} from "../../navigation/actions";
import BPD_ROUTES from "../../navigation/routes";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue
} from "../../store/actions/iban";
import { bpdOnboardingCompleted } from "../../store/actions/onboarding";
import { isBpdOnboardingOngoing } from "../../store/reducers/onboarding/ongoing";

// TODO: if isOnboarding===true, change with an action that triggers a saga that choose
//  which screen to display, (the user already have payment methods or not)
export const chooseContinueAction = (isOnboarding: boolean) =>
  isOnboarding
    ? navigateToBpdOnboardingNoPaymentMethods
    : NavigationActions.back;

export const isMainScreen = (screenName: string) =>
  screenName === BPD_ROUTES.IBAN;

function* ensureMainScreen() {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  if (currentRoute !== undefined && !isMainScreen(currentRoute)) {
    yield* call(navigateToBpdIbanInsertion);
  }
}

/**
 * Old style orchestrator, please don't use this as reference for future development
 * @deprecated
 */
export function* bpdIbanInsertionWorker() {
  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> =
    yield* select(isBpdOnboardingOngoing);
  // ensure the first screen of the saga is the iban main screen.
  yield* call(ensureMainScreen);

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
        yield* call(navigateToBpdOnboardingErrorPaymentMethods);
        yield* put(bpdOnboardingCompleted());
        return;
      }

      const hasAtLeastOnePaymentMethodWithBpd = pot.getOrElse(
        pot.map(paymentMethods, pm =>
          pm.some(p => hasFunctionEnabled(p, EnableableFunctionsEnum.BPD))
        ),
        false
      );
      const nextAction = hasAtLeastOnePaymentMethodWithBpd
        ? navigateToBpdOnboardingEnrollPaymentMethod
        : navigateToBpdOnboardingNoPaymentMethods;
      yield* call(nextAction);
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
