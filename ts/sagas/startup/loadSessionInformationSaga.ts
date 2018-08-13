import { none, Option, some } from "fp-ts/lib/Option";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { BasicResponseTypeWith401, GetSessionT } from "../../api/backend";
import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";

/**
 * Load session info from the Backend
 *
 * FIXME: this logic is common to all sagas that make requests to the backend,
 *        we should create a high order function that converts an API call into
 *        a saga.
 */
export function* loadSessionInformationSaga(
  getSession: TypeofApiCall<GetSessionT>
): IterableIterator<Effect | Option<PublicSession>> {
  // Call the Backend service
  const response:
    | BasicResponseTypeWith401<PublicSession>
    | undefined = yield call(getSession, {});

  if (response && response.status === 200) {
    // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
    yield put(sessionInformationLoadSuccess(response.value));
    return some(response.value);
  }

  // We got a error, send a SESSION_LOAD_FAILURE action
  const error: Error = response
    ? response.value
    : Error("Invalid server response");
  yield put(sessionInformationLoadFailure(error));
  return none;
}
