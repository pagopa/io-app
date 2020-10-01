import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { paymentDeletePayment } from "../../../../../store/actions/wallet/payment";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import { navigateToBpdIbanInsertion } from "../../navigation/action/iban";
import { navigateToBpdOnboardingEnrollPaymentMethod } from "../../navigation/action/onboarding";
import BPD_ROUTES from "../../navigation/routes";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue
} from "../../store/actions/iban";
import { isBpdOnboardingOngoing } from "../../store/reducers/onboarding/ongoing";

// TODO: if onboarding change with an action that triggers a saga that choose which screen to display
//  based on the cards present or not
export const chooseContinueAction = (isOnboarding: boolean) =>
  isOnboarding
    ? navigateToBpdOnboardingEnrollPaymentMethod
    : NavigationActions.back;

export const isMainScreen = (screenName: string) =>
  screenName === BPD_ROUTES.IBAN.INSERTION;

function* ensureMainScreen() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> = yield select(
    isBpdOnboardingOngoing
  );

  if (currentRoute.isSome() && !isMainScreen(currentRoute.value)) {
    yield put(navigateToBpdIbanInsertion());
    if (onboardingOngoing) {
      yield put(navigationHistoryPop(1));
    }
  }
}

export function* bpdIbanInsertionWorker() {
  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> = yield select(
    isBpdOnboardingOngoing
  );
  // ensure the first screen of the saga is the iban insertion screen.
  yield call(ensureMainScreen);
  // wait for the user iban insertion

  const nextAction: ActionType<
    typeof paymentDeletePayment.success | typeof paymentDeletePayment.failure
  > = yield take([
    getType(bpdIbanInsertionCancel),
    getType(bpdIbanInsertionContinue)
  ]);
  if (isActionOf(bpdIbanInsertionCancel, nextAction)) {
    yield put(NavigationActions.back());
  } else {
    if (onboardingOngoing) {
      yield put(navigateToBpdOnboardingEnrollPaymentMethod());
      navigationHistoryPop(1);
    } else {
      yield put(NavigationActions.back());
    }
  }
}

/**
 * This saga start the workflow that allows the user to insert / modify the IBAN associated to bpd.
 */
export function* handleBpdIbanInsertion(): SagaIterator {
  yield call(bpdIbanInsertionWorker);
}
