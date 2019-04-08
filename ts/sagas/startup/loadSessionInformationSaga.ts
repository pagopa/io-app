import { none, Option, some } from "fp-ts/lib/Option";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { GetSessionStateT } from "../../../definitions/backend/requestTypes";

import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";

import { SagaCallReturnType } from "../../types/utils";

/**
 * Load session info from the Backend
 *
 * FIXME: this logic is common to all sagas that make requests to the backend,
 *        we should create a high order function that converts an API call into
 *        a saga.
 */
export function* loadSessionInformationSaga(
  getSession: TypeofApiCall<GetSessionStateT>
): IterableIterator<Effect | Option<PublicSession>> {
  // Call the Backend service
  const response: SagaCallReturnType<typeof getSession> = yield call(
    getSession,
    {}
  );

  if (response.isRight() && response.value.status === 200) {
    // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
    yield put(sessionInformationLoadSuccess(response.value.value));
    return some(response.value);
  }

  // We got a error, send a SESSION_LOAD_FAILURE action
  const error: Error =
    response.isRight() && response.value.status === 500
      ? Error(response.value.value.title)
      : Error("Invalid server response");
  yield put(sessionInformationLoadFailure(error));
  return none;
}
