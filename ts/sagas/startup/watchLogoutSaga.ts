import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, put, take, fork } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { startApplicationInitialization } from "../../store/actions/application";
import {
  logoutFailure,
  logoutRequest,
  logoutSuccess
} from "../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../store/actions/navigation";
import { SagaCallReturnType } from "../../types/utils";
import { resetAssistanceData } from "../../utils/supportAssistance";

export function* logoutSaga(
  logout: ReturnType<typeof BackendClient>["logout"],
  action: ActionType<typeof logoutRequest>
) {
  // Issue a logout request to the backend, asking to delete the session
  // FIXME: if there's no connectivity to the backend, this request will
  //        block for a while.
  try {
    const response: SagaCallReturnType<typeof logout> = yield* call(logout, {});
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield* put(logoutSuccess(action.payload));
      } else {
        // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error = Error(
          response.value.status === 500 && response.value.value.title
            ? response.value.value.title
            : "Unknown error"
        );
        yield* put(logoutFailure({ error, options: action.payload }));
      }
    } else {
      const logoutError = {
        error: Error(readableReport(response.value)),
        options: action.payload
      };
      yield* put(logoutFailure(logoutError));
    }
  } catch (error) {
    const logoutError = {
      error,
      options: action.payload
    };
    yield* put(logoutFailure(logoutError));
  } finally {
    // clean up any assistance data
    resetAssistanceData();
    // If keepUserData is false, startApplicationInitialization is
    // dispatched within the componentDidMount of IngressScreen
    resetToAuthenticationRoute();
    yield* put(startApplicationInitialization());
  }
}

/**
 * Handles the logout flow
 */
export function* watchLogoutSaga(
  logout: ReturnType<typeof BackendClient>["logout"]
) {
  // This saga will handle its own cancelation because
  // it will be spawned using `spawn` instead of `fork`,
  // thus being detached from the main saga, and resulting
  // in duplicated processes.
  while (true) {
    const cancellableAction = yield* take<
      ActionType<
        typeof logoutRequest | typeof logoutSuccess | typeof logoutFailure
      >
    >([
      logoutRequest,

      // Since the logout in the user interface
      // happens with both a success and a failure action
      // this saga will be cancelled in both the cases.
      logoutSuccess,
      logoutFailure
    ]);

    if (cancellableAction.type === getType(logoutRequest)) {
      yield* fork(logoutSaga, logout, cancellableAction);
      continue;
    }

    break;
  }
}
