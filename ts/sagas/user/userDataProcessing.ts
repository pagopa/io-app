import { call, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { userDataProcessingLoad } from "../../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../types/utils";

function* loadUserDataProcessing(
  getUserDataProcessing: ReturnType<
    typeof BackendClient
  >["getUserDataProcessing"],
  action: ActionType<typeof userDataProcessingLoad["request"]>
) {
  const response: SagaCallReturnType<typeof getUserDataProcessing> = yield call(
    getUserDataProcessing,
    { userDataProcessingChoiceParam: action.payload }
  );
  if (response.isRight() && response.value.status === 200) {
    // TODO
  }
}

/**
 * Listen for userDataProcessingLoad.request and calls loadUserDataProcessing saga.
 */
export function* watchLoadUserDataProcessing(
  getUserDataProcessing: ReturnType<
    typeof BackendClient
  >["getUserDataProcessing"]
) {
  yield takeLatest(
    getType(userDataProcessingLoad.request),
    loadUserDataProcessing,
    getUserDataProcessing
  );
}
