import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { navigateToBpdOnboardingLoadActivate } from "../../../navigation/actions";
import BPD_ROUTES from "../../../navigation/routes";
import { bpdAllData } from "../../../store/actions/details";
import { bpdIbanInsertionStart } from "../../../store/actions/iban";
import {
  bpdEnrollUserToProgram,
  bpdOnboardingCancel
} from "../../../store/actions/onboarding";

export const isLoadingScreen = (screenName: string) =>
  screenName === BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD;

function* enrollToBpdWorker() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);

  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page while communicate with the server for the activation
    yield put(navigateToBpdOnboardingLoadActivate());
    yield put(navigationHistoryPop(1));
  }

  // enroll the user and wait for the result
  yield put(bpdEnrollUserToProgram.request());

  const enrollResult: ActionType<typeof bpdEnrollUserToProgram.success> =
    yield take(bpdEnrollUserToProgram.success);

  if (enrollResult.payload.enabled) {
    yield put(bpdAllData.request());
    yield put(bpdIbanInsertionStart());
    yield put(navigationHistoryPop(1));
  }
  // TODO: handle false case to avoid making the user remain blocked in case of malfunction
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
