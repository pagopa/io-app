import { CommonActions } from "@react-navigation/native";
import { call, put, race, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../../../../../navigation/NavigationService";
import { bpdAllData } from "../../../store/actions/details";
import { bpdIbanInsertionStart } from "../../../store/actions/iban";
import {
  bpdEnrollUserToProgram,
  bpdOnboardingCancel
} from "../../../store/actions/onboarding";

export const isLoadingScreen = () => true;

/**
 * Old style orchestrator, please don't use this as reference for future development
 * @deprecated
 */
function* enrollToBpdWorker() {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  if (currentRoute !== undefined && !isLoadingScreen()) {
    // show the loading page while communicate with the server for the activation
    throw new Error("Not in the loading screen");
  }

  // enroll the user and wait for the result
  yield* put(bpdEnrollUserToProgram.request());

  const enrollResult: ActionType<typeof bpdEnrollUserToProgram.success> =
    yield* take(bpdEnrollUserToProgram.success);

  if (enrollResult.payload.enabled) {
    yield* put(bpdAllData.request());
    yield* put(bpdIbanInsertionStart());
  }
  // TODO: handle false case to avoid making the user remain blocked in case of malfunction
}

/**
 * This saga enroll the user to the bpd
 */
export function* handleBpdEnroll() {
  const { cancelAction } = yield* race({
    enroll: call(enrollToBpdWorker),
    cancelAction: take(bpdOnboardingCancel)
  });

  if (cancelAction) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.goBack()
    );
  }
}
