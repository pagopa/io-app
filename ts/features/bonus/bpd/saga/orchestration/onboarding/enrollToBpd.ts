import { Either, left, right } from "fp-ts/lib/Either";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, Effect, put, race, select, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  navigateToBpdOnboardingEnrollPaymentMethod,
  navigateToBpdOnboardingLoadActivate
} from "../../../navigation/action";
import BPD_ROUTES from "../../../navigation/routes";
import {
  bpdOnboardingCancel,
  bpdEnrollUserToProgram
} from "../../../store/actions/onboarding";

export function* enrollUserToBpd(): Generator<
  Effect,
  Either<Error, boolean>,
  any
> {
  yield put(bpdEnrollUserToProgram.request());
  const enrollUserResults: ActionType<
    | typeof bpdEnrollUserToProgram.success
    | typeof bpdEnrollUserToProgram.failure
  > = yield take([
    getType(bpdEnrollUserToProgram.success),
    getType(bpdEnrollUserToProgram.failure)
  ]);
  return enrollUserResults.type === getType(bpdEnrollUserToProgram.success)
    ? right<Error, boolean>(enrollUserResults.payload.enabled)
    : left<Error, boolean>(enrollUserResults.payload);
}

export const isLoadingScreen = (screenName: string) =>
  screenName === BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD;

function* enrollToBpdWorker() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page while communicate with the server for the activation
    yield put(navigateToBpdOnboardingLoadActivate());
    yield put(navigationHistoryPop(1));
  }

  // enroll the user and wait for the result
  const enrollToBpdResult: SagaCallReturnType<typeof enrollUserToBpd> = yield call(
    enrollUserToBpd
  );

  if (enrollToBpdResult.isRight()) {
    // TODO: TEMP, change to IBAN insertion
    yield put(navigateToBpdOnboardingEnrollPaymentMethod());
    yield put(navigationHistoryPop(1));
  }
}

/**
 * This saga enroll the user to the bpd
 */
export function* handleBpdEnroll(): SagaIterator {
  const { cancelAction } = yield race({
    enroll: call(enrollToBpdWorker),
    cancelAction: take(bpdOnboardingCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
