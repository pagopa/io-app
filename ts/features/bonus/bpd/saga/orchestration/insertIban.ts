import * as pot from "italia-ts-commons/lib/pot";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
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
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";

// TODO: if isOnboarding===true, change with an action that triggers a saga that choose
//  which screen to display, (the user already have payment methods or not)
export const chooseContinueAction = (isOnboarding: boolean) =>
  isOnboarding
    ? navigateToBpdOnboardingNoPaymentMethods
    : NavigationActions.back;

export const isMainScreen = (screenName: string) =>
  screenName === BPD_ROUTES.IBAN;

function* ensureMainScreen() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);

  if (currentRoute.isSome() && !isMainScreen(currentRoute.value)) {
    yield put(navigateToBpdIbanInsertion());
  }
}

export function* bpdIbanInsertionWorker() {
  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> =
    yield select(isBpdOnboardingOngoing);
  // ensure the first screen of the saga is the iban main screen.
  yield call(ensureMainScreen);

  // wait for the user iban insertion o cancellation
  const nextAction: ActionType<
    typeof bpdIbanInsertionCancel | typeof bpdIbanInsertionContinue
  > = yield take([
    getType(bpdIbanInsertionCancel),
    getType(bpdIbanInsertionContinue)
  ]);
  if (isActionOf(bpdIbanInsertionCancel, nextAction)) {
    yield put(NavigationActions.back());
  } else {
    if (onboardingOngoing) {
      const paymentMethods: ReturnType<typeof paymentMethodsSelector> =
        yield select(paymentMethodsSelector);

      // Error while loading the wallet, display a message that informs the user about the error
      if (paymentMethods.kind === "PotNoneError") {
        yield put(navigateToBpdOnboardingErrorPaymentMethods());
        yield put(navigationHistoryPop(1));
        yield put(bpdOnboardingCompleted());
        return;
      }

      const hasAtLeastOnePaymentMethodWithBpd = pot.getOrElse(
        pot.map(paymentMethods, pm =>
          pm.some(p => hasFunctionEnabled(p, EnableableFunctionsEnum.BPD))
        ),
        false
      );
      const nextAction = hasAtLeastOnePaymentMethodWithBpd
        ? navigateToBpdOnboardingEnrollPaymentMethod()
        : navigateToBpdOnboardingNoPaymentMethods();
      yield put(nextAction);
      yield put(navigationHistoryPop(1));
      yield put(bpdOnboardingCompleted());
    } else {
      yield put(NavigationActions.back());
    }
  }
}

/**
 * This saga start the workflow that allows the user to insert / modify the IBAN associated to bpd.
 * In this first phase subject to changes, the call to the bpdIbanInsertionWorker is preserved,
 * instead of removing the call.
 */
export function* handleBpdIbanInsertion(): SagaIterator {
  yield call(bpdIbanInsertionWorker);
}
