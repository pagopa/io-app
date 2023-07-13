import { takeLatest, call } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import {
  itwActivationStart,
  itwCredentialsAddPid,
  itwRequirementsRequest
} from "../store/actions";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../navigation/routes";
import { handleRequirementsRequest } from "./handleRequirementsCheck";
import { handleCredentialsAddPid } from "./handleCredentials";

export function* watchItwSaga(): SagaIterator {
  yield* takeLatest(itwActivationStart, watchItwActivationStart);

  /**
   * Handles requirements check for activation.
   */
  yield* takeLatest(itwRequirementsRequest.request, handleRequirementsRequest);

  /**
   * Handles adding a PID to the ITW credentials.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

function* watchItwActivationStart(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ACTIVATION.DETAILS
    })
  );
}
