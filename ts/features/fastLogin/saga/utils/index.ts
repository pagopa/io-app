import { call, select, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import { isFastLoginEnabledSelector } from "../../store/selectors";
import {
  refreshSessionToken,
  sessionExpired
} from "../../../../store/actions/authentication";

export function* withRefreshApiCall<R>(
  f: Promise<t.Validation<IResponseType<401, any> | R>>,
  errorMessage: string = "Session expired"
) {
  const response = yield* call(() => f);
  // BEWARE: we can cast to any only because we know for sure that f will
  // always return a Promise<IResponseType<A, B>>
  if (E.isRight(response) && (response.right as any).status === 401) {
    yield* call(handleSessionExpiredSaga);
    throw new Error(errorMessage);
  }
  return response;
}

export function* handleSessionExpiredSaga() {
  const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
  if (isFastLoginEnabled) {
    yield* put(refreshSessionToken.request());
  } else {
    yield* put(sessionExpired());
  }
}
