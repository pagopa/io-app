import { call, select, put, take, race, delay } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import { SagaIterator } from "redux-saga";
import { isActionOf } from "typesafe-actions";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { isFastLoginEnabledSelector } from "../../store/selectors";
import {
  checkCurrentSession,
  sessionExpired
} from "../../../common/store/actions";
import { Action } from "../../../../../store/actions/types";
import {
  refreshSessionToken,
  savePendingAction
} from "../../store/actions/tokenRefreshActions";
import { isDevEnv } from "../../../../../utils/environment";

const ACTION_TO_WAIT_FOR_TIMEOUT = 3000 as Millisecond;

type RefreshApiCallErrorHandlingTypeWithTypeField = {
  errorMessage?: string;
  skipThrowingError?: boolean;
  // Because we check the "type" field in a type guard
  // looking for a Redux Action,
  // we must be sure to never put a property named "type"
  // inside this object.
  type?: never;
};

type RefreshThirdPartyApiCallErrorHandling = {
  errorMessage?: string;
  skipThrowingError?: boolean;
};

export type RefreshThirdPartyApiCallOptions =
  | {
      action?: Action;
      errorHandling: never;
    }
  | {
      action: never;
      errorHandling?: RefreshThirdPartyApiCallErrorHandling;
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
  actionOrErrorHandling?: A | RefreshApiCallErrorHandlingType
): SagaIterator<t.Validation<IResponseType<401, any> | R>> {
  const response = yield* call(() => apiCall);

  // eslint-disable-next-line functional/no-let
  let action: A | undefined;
  // eslint-disable-next-line functional/no-let
  let errorHandling: typeof actionOrErrorHandling = {};

  if (isReduxAction(actionOrErrorHandling)) {
    action = actionOrErrorHandling;
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

function* waitForTheTokenRefreshToBeStarted(errorMessage?: string) {
  const { refreshAction, timeout } = yield* race({
    refreshAction: take(refreshSessionToken.request),
    timeout: delay(ACTION_TO_WAIT_FOR_TIMEOUT)
  });

  if (timeout) {
    throw new Error(errorMessage);
  }

  return refreshAction;
}

function isSessionValidOrWeFailedToCheck(resultAction: Action) {
  return (
    (isActionOf(checkCurrentSession.success, resultAction) &&
      resultAction.payload.isSessionValid) ||
    isActionOf(checkCurrentSession.failure, resultAction)
  );
}

function isSessionInvalid(resultAction: Action) {
  return (
    isActionOf(checkCurrentSession.success, resultAction) &&
    !resultAction.payload.isSessionValid
  );
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function* withThirdPartyRefreshApiCall<R>(
  apiCall: Promise<t.Validation<IResponseType<401, any> | R>>,
  options?: RefreshThirdPartyApiCallOptions
): SagaIterator<t.Validation<IResponseType<401, any> | R>> {
  const response = yield* call(() => apiCall);

  const { action, errorHandling } = options ?? {};
  const { errorMessage, skipThrowingError } = errorHandling ?? {};

  // BEWARE: we can cast to any only because we know for sure that f will
  // always return a Promise<IResponseType<A, B>>
  if (E.isRight(response) && (response.right as any).status === 401) {
    // We need to check the current session
    // to be sure that the session is really expired
    yield* put(checkCurrentSession.request());
    // We need to wait for those actions to be dispatched
    // - checkCurrentSession.success with payload isSessionValid === true.
    // - or checkCurrentSession.failure
    // - or refreshSessionToken.request
    //     (refreshSessionToken.failure is already taken into account
    //     during the call to handleSessionExpiredSaga)
    const resultAction = yield* take([
      checkCurrentSession.success,
      checkCurrentSession.failure
    ]);

    if (isSessionValidOrWeFailedToCheck(resultAction)) {
      // If the session is still valid,
      // or if we failed to check the session,
      // we should throw an error
      throw new ThirdPartyTokenError(errorMessage);
    }

    if (isSessionInvalid(resultAction)) {
      // If the session is expired...
      // The checkSessionResult will call handleSessionExpiredSaga
      try {
        // We save the pending action, if any.
        if (action) {
          yield* put(savePendingAction({ pendingAction: action }));
        }
        // The token refresh flow is started.
        // The refreshSessionToken.request action will be dispatched,
        // and the refreshing flow is started.
        yield* call(waitForTheTokenRefreshToBeStarted, errorMessage);
      } catch (e) {
        // If for some reason the token refresh flow is not started,
        // we should throw an error.
        throw new ThirdPartyTokenError(errorMessage);
      }

      if (!action && !skipThrowingError) {
        // If we passed no action, we should throw an error.
        // So that the caller can handle it showing a gneric error message,
        // after the session is refreshed.
        throw new Error(errorMessage);
      } else {
        // Otherwise we return the response.
        // The caller should intercept the 401 error and stop the execution.
        // The handleSessionExpiredSaga will dispatch the pending action,
        // once the session is refreshed,
        // and the flow should restart from the beginning.
        return response;
      }
    }
  }
  // If the response is not a 401, we can return it as it is.
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

type ThirdPartyTokenErrorType = "SESSION_IS_STILL_VALID";
export class ThirdPartyTokenError extends Error {
  public readonly type?: ThirdPartyTokenErrorType;

  constructor(
    message: string | undefined,
    type: ThirdPartyTokenErrorType = "SESSION_IS_STILL_VALID"
  ) {
    // Pass parent constructor parameters
    super(message);

    // Maintains stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ThirdPartyTokenError);
    }

    this.name = "ThirdPartyTokenError";
    if (message) {
      this.message = message;
    }
    // Set custom information
    this.type = type;
  }
}
export const utilsExport = isDevEnv
  ? {
      isReduxAction,
      waitForTheTokenRefreshToBeStarted
    }
  : undefined;
