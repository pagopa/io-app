import { left, right } from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  loadUserDataProcessing,
  requestUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../types/utils";

/**
 * The following logic:
 * - checks if there are updates on the processing of a previous request
 * - sumbits a new request if the state is ClOSED or if this is the first request
 */
// tslint:disable-next-line:cognitive-complexity
export function* loadUserDataProcessingSaga(
  getUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["getUserDataProcessingRequest"],
  action: ActionType<typeof loadUserDataProcessing["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response: SagaCallReturnType<
      typeof getUserDataProcessingRequest
    > = yield call(getUserDataProcessingRequest, {
      userDataProcessingChoiceParam: choice
    });
    if (
      response.isRight() &&
      (response.value.status === 404 || response.value.status === 200)
    ) {
      yield put(
        loadUserDataProcessing.success({
          choice,
          value:
            response.value.status === 200 ? response.value.value : undefined
        })
      );
    } else {
      throw new Error(
        "An error occurs while fetching data on user data processisng status"
      );
    }
  } catch (e) {
    yield put(
      loadUserDataProcessing.failure({
        choice,
        error: new Error(e)
      })
    );
  }
}

export function* requestUserDataProcessingSaga(
  postUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["postUserDataProcessingRequest"],
  action: ActionType<typeof requestUserDataProcessing["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response: SagaCallReturnType<
      typeof postUserDataProcessingRequest
    > = yield call(postUserDataProcessingRequest, {
      userDataProcessingChoiceRequest: { choice }
    });

    if (response.isRight() && response.value.status === 200) {
      yield put(requestUserDataProcessing.success(response.value.value));
      return right(response.value.value);
    } else {
      throw new Error(
        `An error occurred while submitting a request to ${choice} the profile`
      );
    }
  } catch (e) {
    yield put(
      requestUserDataProcessing.failure({ choice, error: new Error(e) })
    );
    return left(e);
  }
}

/**
 * Listen for requests related to the user data processing (profile deletion or profile-related data downloading)
 */
export function* watchUserDataProcessingSaga(
  getUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["getUserDataProcessingRequest"],
  postUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["postUserDataProcessingRequest"]
): SagaIterator {
  yield takeLatest(
    loadUserDataProcessing.request,
    loadUserDataProcessingSaga,
    getUserDataProcessingRequest
  );

  yield takeEvery(
    requestUserDataProcessing.request,
    requestUserDataProcessingSaga,
    postUserDataProcessingRequest
  );
}
