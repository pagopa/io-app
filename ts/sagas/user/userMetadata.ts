import { Either, left, right } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { UserMetadata as BackendUserMetadata } from "../../../definitions/backend/UserMetadata";
import { BackendClient } from "../../api/backend";
import { userMetadataLoad } from "../../store/actions/userMetadata";
import {
  backendUserMetadataToUserMetadata,
  UserMetadata
} from "../../store/reducers/userMetadata";
import { SagaCallReturnType } from "../../types/utils";

/**
 * A saga to fetch user metadata from the Backend
 */
export function* fetchUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"]
): IterableIterator<Effect | Either<Error, BackendUserMetadata>> {
  try {
    const response: SagaCallReturnType<typeof getUserMetadata> = yield call(
      getUserMetadata,
      {}
    );

    // Can't decode response
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }

    if (response.value.status !== 200) {
      const error =
        response.value.status === 500 ? response.value.value.title : undefined;
      // Return the error
      return left(Error(error));
    }

    return right(response.value.value);
  } catch (error) {
    return left(error);
  }
}

export function* loadUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"],
  setLoading: boolean = false
): IterableIterator<Effect | Option<UserMetadata>> {
  const backendUserMetadataOrError: SagaCallReturnType<
    typeof fetchUserMetadata
  > = yield call(fetchUserMetadata, getUserMetadata);

  if (setLoading) {
    yield put(userMetadataLoad.request());
  }

  if (backendUserMetadataOrError.isLeft()) {
    yield put(userMetadataLoad.failure(backendUserMetadataOrError.value));
  } else {
    const backendUserMetadata = backendUserMetadataOrError.value;

    const userMetadataOrError = backendUserMetadataToUserMetadata(
      backendUserMetadata
    );
    if (userMetadataOrError.isLeft()) {
      yield put(userMetadataLoad.failure(userMetadataOrError.value));
    } else {
      yield put(userMetadataLoad.success(userMetadataOrError.value));
    }
  }
}

export function* watchLoadUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"]
) {
  yield takeLatest(
    getType(userMetadataLoad.request),
    loadUserMetadata,
    getUserMetadata
  );
}
