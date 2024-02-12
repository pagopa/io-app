import { call, select, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import { SagaIterator } from "redux-saga";
import { isFastLoginEnabledSelector } from "../../store/selectors";
import { sessionExpired } from "../../../../store/actions/authentication";
import { Action } from "../../../../store/actions/types";
import {
  refreshSessionToken,
  savePendingAction
} from "../../store/actions/tokenRefreshActions";

type RefreshApiCallErrorHandlingTypeWithTypeField = {
  errorMessage?: string;
  skipThrowingError?: boolean;
  // Because we check the "type" field in a type guard
  // looking for a Redux Action,
  // we must be sure to never put a property named "type"
  // inside this object.
  type?: never;
};

export type RefreshApiCallErrorHandlingType = Omit<
  RefreshApiCallErrorHandlingTypeWithTypeField,
  "type"
>;

function isReduxAction<A extends Action>(
  obj?: A | RefreshApiCallErrorHandlingType
): obj is A {
  return !!(obj && "type" in obj);
}

// The function implementation with flexible parameter handling
// This has been done as a refactor to avoid the use of optional parameters
export function* withRefreshApiCall<R, A extends Action>(
  apiCall: Promise<t.Validation<IResponseType<401, any> | R>>,
  actionOrErrorHandling?: A | RefreshApiCallErrorHandlingType,
  errorHandlingOrUndefined?: RefreshApiCallErrorHandlingType
): SagaIterator<t.Validation<IResponseType<401, any> | R>> {
  const response = yield* call(() => apiCall);

  // eslint-disable-next-line functional/no-let
  let action: A | undefined;
  // eslint-disable-next-line functional/no-let
  let errorHandling:
    | typeof actionOrErrorHandling
    | typeof errorHandlingOrUndefined = {};

  if (isReduxAction(actionOrErrorHandling)) {
    action = actionOrErrorHandling;
    errorHandling = errorHandlingOrUndefined ?? {};
  } else {
    errorHandling =
      (actionOrErrorHandling as RefreshApiCallErrorHandlingType) ?? {};
  }

  const { errorMessage, skipThrowingError } = errorHandling;
  // BEWARE: we can cast to any only because we know for sure that f will
  // always return a Promise<IResponseType<A, B>>
  if (E.isRight(response) && (response.right as any).status === 401) {
    if (action) {
      yield* put(savePendingAction({ pendingAction: action }));
    }
    yield* call(handleSessionExpiredSaga);
    if (!action && !skipThrowingError) {
      throw new Error(errorMessage ?? "UNKNOWN");
    }
  }
  return response;
}

export function* handleSessionExpiredSaga() {
  const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
  if (isFastLoginEnabled) {
    yield* put(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  } else {
    yield* put(sessionExpired());
  }
}
