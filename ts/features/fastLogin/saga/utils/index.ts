import { call, select, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import { SagaIterator } from "redux-saga";
import { isFastLoginEnabledSelector } from "../../store/selectors";
import {
  refreshSessionToken,
  sessionExpired
} from "../../../../store/actions/authentication";
import { Action } from "../../../../store/actions/types";
import { savePendingAction } from "../../actions";

export function* withRefreshApiCall<R, A extends Action>(
  f: Promise<t.Validation<IResponseType<401, any> | R>>,
  action?: A | undefined,
  errorMessage?: string
): SagaIterator<t.Validation<IResponseType<401, any> | R>> {
  const response = yield* call(() => f);
  // BEWARE: we can cast to any only because we know for sure that f will
  // always return a Promise<IResponseType<A, B>>
  if (E.isRight(response) && (response.right as any).status === 401) {
    if (action) {
      yield* put(savePendingAction({ pendingAction: action }));
    }
    yield* call(handleSessionExpiredSaga);
    if (!action) {
      throw new Error(errorMessage ?? "UNKNOWN");
    }
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
