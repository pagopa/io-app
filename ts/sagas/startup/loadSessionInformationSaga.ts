import { none, Option, some } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { PublicSession } from "../../../definitions/backend/PublicSession";

import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";

import { BackendClient } from "../../api/backend";
import { SagaCallReturnType } from "../../types/utils";

/**
 * Load session info from the Backend
 *
 * FIXME: this logic is common to all sagas that make requests to the backend,
 *        we should create a high order function that converts an API call into
 *        a saga.
 */
export function* loadSessionInformationSaga(
  getSession: ReturnType<typeof BackendClient>["getSession"]
): IterableIterator<Effect | Option<PublicSession>> {
  // Call the Backend service
  const response: SagaCallReturnType<typeof getSession> = yield call(
    getSession,
    {}
  );

  // Ko we got an error
  if (response.isLeft()) {
    yield put(
      sessionInformationLoadFailure(Error(readableReport(response.value)))
    );
    return none;
  }

  if (response.value.status === 200) {
    // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
    yield put(sessionInformationLoadSuccess(response.value.value));
    return some(response.value.value);
  }

  // we got a valid response but its status code is describing an error
  const errorMsgDefault = "Invalid server response";
  const error = Error(
    response.value.status === 400
      ? response.value.value.title || errorMsgDefault
      : errorMsgDefault
  );
  yield put(sessionInformationLoadFailure(error));
  return none;
}
