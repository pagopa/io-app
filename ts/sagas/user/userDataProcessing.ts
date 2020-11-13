import { left, right } from "fp-ts/lib/Either";
import { readableReport } from "italia-ts-commons/lib/reporters";
import reactotron from "reactotron-react-native";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  loadUserDataProcessing,
  upsertUserDataProcessing,
  deleteUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../types/utils";

/**
 * The following logic:
 * - checks if there are updates on the processing of a previous request
 * - sumbits a new request if the state is ClOSED or if this is the first request
 */
export function* loadUserDataProcessingSaga(
  getUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["getUserDataProcessingRequest"],
  action: ActionType<typeof loadUserDataProcessing["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response: SagaCallReturnType<typeof getUserDataProcessingRequest> = yield call(
      getUserDataProcessingRequest,
      {
        userDataProcessingChoiceParam: choice
      }
    );
    if (response.isRight()) {
      if (response.value.status === 404 || response.value.status === 200) {
        yield put(
          loadUserDataProcessing.success({
            choice,
            value:
              response.value.status === 200 ? response.value.value : undefined
          })
        );
      } else {
        throw new Error(
          `loadUserDataProcessingSaga response status ${response.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(response.value));
    }
  } catch (e) {
    yield put(
      loadUserDataProcessing.failure({
        choice,
        error: e
      })
    );
  }
}

export function* upsertUserDataProcessingSaga(
  postUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["postUserDataProcessingRequest"],
  action: ActionType<typeof upsertUserDataProcessing["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response: SagaCallReturnType<typeof postUserDataProcessingRequest> = yield call(
      postUserDataProcessingRequest,
      {
        userDataProcessingChoiceRequest: { choice }
      }
    );

    if (response.isRight() && response.value.status === 200) {
      yield put(upsertUserDataProcessing.success(response.value.value));
      return right(response.value.value);
    } else {
      throw new Error(
        `An error occurred while submitting a request to ${choice} the profile`
      );
    }
  } catch (e) {
    yield put(
      upsertUserDataProcessing.failure({ choice, error: new Error(e) })
    );
    return left(e);
  }
}

export function* deleteUserDataProcessingSaga(
  deleteUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["deleteUserDataProcessingRequest"],
  action: ActionType<typeof deleteUserDataProcessing["request"]>
): SagaIterator {
  const choice = action.payload;

  try {
    const response: SagaCallReturnType<typeof deleteUserDataProcessingRequest> = yield call(
      deleteUserDataProcessingRequest,
      {
        userDataProcessingChoiceParam: choice
      }
    );
    reactotron.log(response);
    if (response.isRight()) {
      reactotron.log(response.value.status);

      if (response.value.status === 404 || response.value.status === 202) {
        yield put(
          deleteUserDataProcessing.success({
            choice
            // value:
            //   response.value.status === 202 ? response.value.value : undefined
          })
        );
      } else {
        throw new Error(
          `deleteUserDataProcessing response status ${response.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(response.value));
    }
  } catch (e) {
    yield put(
      deleteUserDataProcessing.failure({
        choice,
        error: e
      })
    );
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
  >["postUserDataProcessingRequest"],
  deleteUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["deleteUserDataProcessingRequest"]
): SagaIterator {
  yield takeEvery(
    loadUserDataProcessing.request,
    loadUserDataProcessingSaga,
    getUserDataProcessingRequest
  );

  yield takeEvery(
    deleteUserDataProcessing.request,
    deleteUserDataProcessingSaga,
    deleteUserDataProcessingRequest
  );

  yield takeEvery(
    upsertUserDataProcessing.request,
    upsertUserDataProcessingSaga,
    postUserDataProcessingRequest
  );
}
