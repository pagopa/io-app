import { Either, right } from "fp-ts/lib/Either";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import {
  call,
  Effect,
  put,
  race,
  select,
  take,
  delay
} from "redux-saga/effects";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  navigateToBpdOnboardingEnrollPaymentMethod,
  navigateToBpdOnboardingLoadActivate
} from "../../../navigation/action";
import BPD_ROUTES from "../../../navigation/routes";
import { BpdOnboardingCancel } from "../../../store/actions/onboarding";

// TODO: check with matteo, this call doesn't require a store value, maybe we can call directly and remove this information from the store
export function* enrollToBpd(): Generator<Effect, Either<Error, boolean>, any> {
  yield delay(1000);
  return right<Error, boolean>(true);
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
  const enrollToBpdResult: SagaCallReturnType<typeof enrollToBpd> = yield call(
    enrollToBpd
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
