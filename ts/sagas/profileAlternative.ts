import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { BackendClient } from "../api/backend";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { readablePrivacyReport } from "../utils/reporters";
import {
  profileAlternativeLoadFailure,
  profileAlternativeLoadRequest,
  profileAlternativeLoadSuccess
} from "../store/actions/profileAlternative";
import { convertUnknownToError } from "../utils/errors";
import { withRefreshApiCall } from "../features/fastLogin/saga/utils";

export function* loadProfileAlternative(
  getProfileAlternative: ReturnType<
    typeof BackendClient
  >["getProfileAlternative"]
): Generator<
  ReduxSagaEffect,
  O.Option<InitializedProfile>,
  SagaCallReturnType<typeof getProfileAlternative>
> {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getProfileAlternative({})
    )) as unknown as SagaCallReturnType<typeof getProfileAlternative>;

    if (E.isLeft(response)) {
      throw Error(readablePrivacyReport(response.left));
    }

    if (response.right.status === 200) {
      yield* put(
        profileAlternativeLoadSuccess(
          response.right.value as InitializedProfile
        )
      );
      return O.some(response.right.value);
    }

    throw Error(`response status ${response.right.status}`);
  } catch (e) {
    yield* put(profileAlternativeLoadFailure(convertUnknownToError(e)));
  }
  return O.none;
}

export function* watchProfileRequest(
  getProfileAlternative: ReturnType<
    typeof BackendClient
  >["getProfileAlternative"]
): Iterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(profileAlternativeLoadRequest),
    loadProfileAlternative,
    getProfileAlternative
  );
}
