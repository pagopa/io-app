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
  BpdOnboardingCancel,
  enrollToBpd
} from "../../../store/actions/onboarding";

// TODO: check with matteo, this call doesn't require a store value, maybe we can call directly and remove this information from the store
export function* enrollUserToBpd(): Generator<
  Effect,
  Either<Error, boolean>,
  any
> {
  yield put(enrollToBpd.request());
  const enrollUserResults: ActionType<
    typeof enrollToBpd.success | typeof enrollToBpd.failure
  > = yield take([getType(enrollToBpd.success), getType(enrollToBpd.failure)]);
  return enrollUserResults.type === getType(enrollToBpd.success)
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
    cancelAction: take(BpdOnboardingCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
