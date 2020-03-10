import { left, right } from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, fork, put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { ActionType } from "typesafe-actions";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import { BackendClient } from "../../api/backend";
import {
  loadUserDataProcessing,
  manageUserDataProcessing,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../types/utils";

function* loadUserDataProcessingSaga(
  getUserDataProcessing: ReturnType<
    typeof BackendClient
  >["getUserDataProcessing"],
  choice: UserDataProcessingChoiceEnum
): SagaIterator {
  try {
    const response: SagaCallReturnType<
      typeof getUserDataProcessing
    > = yield call(getUserDataProcessing, {
      userDataProcessingChoiceParam: choice
    });
    if (response.isRight()) {
      if (response.value.status === 200) {
        // There is a previous request being processed
        yield put(
          loadUserDataProcessing.success({
            choice,
            value: response.value.value
          })
        );
      } else if (response.value.status === 404) {
        // Any previous request is being processed
        yield put(loadUserDataProcessing.success({ choice, value: undefined }));
      }
    } else {
      throw new Error(
        "An error occurs while fetching data on user data processisng status"
      ); // TODO
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

function* upsertUserDataProcessingSaga(
  postUserDataProcessing: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserDataProcessing"],
  userDataProcessing: UserDataProcessing
): SagaIterator {
  try {
    const response: SagaCallReturnType<
      typeof postUserDataProcessing
    > = yield call(postUserDataProcessing, {
      userDataProcessingChoiceRequest: { choice: userDataProcessing.choice }
    });

    if (response.isRight() && response.value.status === 200) {
      yield put(upsertUserDataProcessing.success(response.value.value));
      return right(response.value.value);
    } else {
      throw new Error(
        `An error occurred while submitting a request to ${
          userDataProcessing.choice
        } the profile`
      );
    }
  } catch (e) {
    yield put(
      upsertUserDataProcessing.failure({
        choice: userDataProcessing.choice,
        error: new Error(e)
      })
    );
    return left(e);
  }
}

/**
 * Listen for requests related to the user data processing (profile deletion or profile-related data downloading)
 */
export function* watchUserDataProcessingSaga(
  getUserDataProcessing: ReturnType<
    typeof BackendClient
  >["getUserDataProcessing"],
  createOrUpdateUserDataProcessing: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserDataProcessing"]
): SagaIterator {
  yield takeEvery(getType(manageUserDataProcessing), function*(
    manageAction: ActionType<typeof manageUserDataProcessing>
  ) {
    const choice = manageAction.payload;

    yield fork(loadUserDataProcessingSaga, getUserDataProcessing, choice);

    yield takeEvery(getType(loadUserDataProcessing.success), function*(
      loadAction: ActionType<typeof loadUserDataProcessing["success"]>
    ) {
      const request = loadAction.payload.value;
      /**
       * A new request is submitted if:
       * - it is the first request being submitted
       * - the previous request has been processed
       */
      if (
        request === undefined ||
        (request && request.status === UserDataProcessingStatusEnum.CLOSED)
      ) {
        const newRequest: UserDataProcessing = {
          choice,
          status: UserDataProcessingStatusEnum.PENDING,
          version: request === undefined ? 1 : request.version + 1
        };

        yield fork(
          upsertUserDataProcessingSaga,
          createOrUpdateUserDataProcessing,
          newRequest
        );
      }
    });
  });
}
