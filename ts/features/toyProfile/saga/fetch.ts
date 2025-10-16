import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend.ts";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils.ts";
import { ToyProfileResponse } from "../types";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { getToyProfileDetailsAction } from "../store/actions";
import { getNetworkError } from "../../../utils/errors.ts";

export function* loadToyProfileSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Generator<
  ReduxSagaEffect,
  O.Option<ToyProfileResponse>,
  SagaCallReturnType<typeof getProfile>
> {
  try {
    const resp = (yield* call(
      withRefreshApiCall,
      getProfile({})
    )) as unknown as SagaCallReturnType<typeof getProfile>;

    if (E.isLeft(resp)) {
      throw Error(`error: ${resp.left.map(e => e.message).join(", ")}`);
    }

    if (resp.right.status === 200) {
      yield* put(
        getToyProfileDetailsAction.success(
          resp.right.value as ToyProfileResponse
        )
      );
      return O.some(resp.right.value as ToyProfileResponse);
    }

    throw resp ? Error(`response status ${resp.right.status}`) : "No data";
  } catch (err) {
    // FAILED ACTION
    yield* put(getToyProfileDetailsAction.failure(getNetworkError(err)));
  }
  return O.none;
}

export function* watchToyProfileSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(getToyProfileDetailsAction.request),
    loadToyProfileSaga,
    getProfile
  );
}
