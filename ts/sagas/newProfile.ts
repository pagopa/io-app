import { call, put, takeLatest } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import { BackendClient } from "../api/backend";
import { readablePrivacyReport } from "../utils/reporters";
import {
  getNewProfile,
  getNewProfileError,
  getNewProfileSuccess
} from "../store/actions/newProfile";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { convertUnknownToError } from "../utils/errors";
import { sessionExpired } from "../store/actions/authentication";

type ProfileApiReturn = ReturnType<typeof BackendClient>["getProfile"];

/**
 * Fetches the user profile.
 * Dispatches a success or fail action based on the API response.
 * @param getProfile - the backend getProfile API function.
 */
export function* fetchNewProfile(getProfile: ProfileApiReturn) {
  try {
    const response = yield* call(getProfile, {});
    if (E.isLeft(response)) {
      yield* put(
        getNewProfileError(new Error(readablePrivacyReport(response.left)))
      );
    } else if (response.right.status === 200) {
      yield* put(
        getNewProfileSuccess(response.right.value as InitializedProfile)
      );
    } else if (response.right.status === 401) {
      yield* put(
        getNewProfileError(convertUnknownToError(response.right.status))
      );
      yield* put(sessionExpired());
    }
    return;
  } catch (e) {
    yield* put(getNewProfileError(convertUnknownToError(e)));
    return;
  }
}

/**
 * Executes fetchNewProfile saga on each dispatched 'getNewProfile' action.
 * Gets the response of the latest request which was fired.
 */
export function* watchNewProfileSaga(getProfileApi: ProfileApiReturn) {
  yield* takeLatest(getType(getNewProfile), fetchNewProfile, getProfileApi);
}
