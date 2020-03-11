import { left, right } from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import { BackendClient } from "../../api/backend";
import {
  loadUserDataProcessing,
  manageUserDataDeletion,
  manageUserDataDownloading,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../types/utils";

/**
 * The following logic:
 * - checks if there are updates on the processing of a previous request
 * - sumbits a new request if the state is ClOSED or if this is the first request
 */
export function* manageUserDataProcessingSaga(
  getUserDataProcessing: ReturnType<
    typeof BackendClient
  >["getUserDataProcessing"],
  createOrUpdateUserDataProcessing: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserDataProcessing"],
  choice: UserDataProcessingChoiceEnum
): SagaIterator {
  yield put(loadUserDataProcessing.request(choice));
  try {
    const response: SagaCallReturnType<
      typeof getUserDataProcessing
    > = yield call(getUserDataProcessing, {
      userDataProcessingChoiceParam: choice
    });
    if (response.isRight()) {
      if (response.value.status === 404 || response.value.status === 200) {
        yield put(
          loadUserDataProcessing.success({
            choice,
            value:
              response.value.status === 200 ? response.value.value : undefined
          })
        );
        /**
         * A new request is submitted if:
         * - it is the first request being submitted
         * - the previous request has been processed
         */
        if (
          response.value.status === 404 ||
          (response.value.status === 200 &&
            response.value.value.status === UserDataProcessingStatusEnum.CLOSED)
        ) {
          const newRequest: UserDataProcessing = {
            choice,
            status: UserDataProcessingStatusEnum.PENDING,
            version:
              response.value.status === 200
                ? response.value.value.version + 1
                : 1
          };

          yield call(
            upsertUserDataProcessingSaga,
            createOrUpdateUserDataProcessing,
            newRequest
          );
        }
      }
    } else {
      throw "An error occurs while fetching data on user data processisng status"
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

export function* upsertUserDataProcessingSaga(
  postUserDataProcessing: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserDataProcessing"],
  userDataProcessing: UserDataProcessing
): SagaIterator {
  yield put(upsertUserDataProcessing.request(userDataProcessing));
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
  yield takeLatest(
    getType(manageUserDataDownloading),
    manageUserDataProcessingSaga,
    getUserDataProcessing,
    createOrUpdateUserDataProcessing,
    UserDataProcessingChoiceEnum.DOWNLOAD
  );

  yield takeLatest(
    getType(manageUserDataDeletion),
    manageUserDataProcessingSaga,
    getUserDataProcessing,
    createOrUpdateUserDataProcessing,
    UserDataProcessingChoiceEnum.DELETE
  );
}
