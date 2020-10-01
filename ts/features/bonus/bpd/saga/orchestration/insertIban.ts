import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import {
  navigateToBpdIbanInsertion,
  navigateToBpdIbanKOCannotVerify,
  navigateToBpdIbanKONotOwned,
  navigateToBpdIbanKOWrong
} from "../../navigation/action/iban";
import { navigateToBpdOnboardingEnrollPaymentMethod } from "../../navigation/action/onboarding";
import BPD_ROUTES from "../../navigation/routes";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue,
  bpdUpsertIban
} from "../../store/actions/iban";
import { isBpdOnboardingOngoing } from "../../store/reducers/onboarding/ongoing";
import { IbanStatus } from "../networking/patchCitizenIban";

// TODO: if onboarding change with an action that triggers a saga that choose which screen to display
//  based on the cards present or not
export const chooseContinueAction = (isOnboarding: boolean) =>
  isOnboarding
    ? navigateToBpdOnboardingEnrollPaymentMethod
    : NavigationActions.back;

export const chooseNextScreen = (
  ibantype: IbanStatus,
  isOnboarding: boolean
) => {
  switch (ibantype) {
    case IbanStatus.OK:
      return chooseContinueAction(isOnboarding);
    case IbanStatus.NOT_VALID:
      return navigateToBpdIbanKOWrong;
    case IbanStatus.CANT_VERIFY:
      return navigateToBpdIbanKOCannotVerify;
    case IbanStatus.NOT_OWNED:
      return navigateToBpdIbanKONotOwned;
    default:
      throw new Error(`${ibantype} not handled!`);
  }
};

export const isMainScreen = (screenName: string) =>
  screenName === BPD_ROUTES.IBAN.INSERTION;

function* ensureMainScreen() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && !isMainScreen(currentRoute.value)) {
    yield put(navigateToBpdIbanInsertion());
  }
}

export function* bpdIbanInsertionWorker() {
  const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> = yield select(
    isBpdOnboardingOngoing
  );
  // ensure the first screen of the saga is the iban insertion screen.
  yield call(ensureMainScreen);
  // wait for the user iban insertion
  const result: ActionType<typeof bpdUpsertIban.success> = yield take(
    bpdUpsertIban.success
  );
  const nextNavigation = chooseNextScreen(
    result.payload.status,
    onboardingOngoing
  );

  yield put(nextNavigation());
  yield put(navigationHistoryPop(1));
  // yield put(navigationHistoryPop(1));
  if (nextNavigation !== chooseContinueAction(onboardingOngoing)) {
    yield take(bpdIbanInsertionContinue);
    yield put(chooseContinueAction(onboardingOngoing)());
  }
}

/**
 * This saga start the workflow that allows the user to insert / modify the IBAN associated to bpd.
 */
export function* handleBpdIbanInsertion(): SagaIterator {
  const { cancelAction, continueAction } = yield race({
    enroll: call(bpdIbanInsertionWorker),
    cancelAction: take(bpdIbanInsertionCancel),
    continueAction: take(bpdIbanInsertionContinue)
  });
  // the user chooses to abort the operation, return to the previous screen.
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
  // the user chooses to continue, navigate to the appropriate section based on the triggering flow.
  else if (continueAction) {
    const onboardingOngoing: ReturnType<typeof isBpdOnboardingOngoing> = yield select(
      isBpdOnboardingOngoing
    );
    const continueAction = chooseContinueAction(onboardingOngoing);
    yield put(continueAction());
  }
}
