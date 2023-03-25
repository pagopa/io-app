import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";

import { call, fork, put, take } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { deleteCurrentLollipopKeyAndGenerateNewKeyTag } from "../../features/lollipop/saga";
import { startApplicationInitialization } from "../../store/actions/application";
import {
  logoutFailure,
  logoutRequest,
  logoutSuccess
} from "../../store/actions/authentication";
import {
  StartupStatusEnum,
  startupLoadSuccess
} from "../../store/actions/startup";
import { SagaCallReturnType } from "../../types/utils";
import { convertUnknownToError } from "../../utils/errors";
import { resetAssistanceData } from "../../utils/supportAssistance";

export function* logoutSaga(
  logout: ReturnType<typeof BackendClient>["logout"],
  _: ActionType<typeof logoutRequest>
) {
  // Issue a logout request to the backend, asking to delete the session
  // FIXME: if there's no connectivity to the backend, this request will
  //        block for a while.
  try {
    const response: SagaCallReturnType<typeof logout> = yield* call(logout, {});
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(logoutSuccess());
      } else {
        // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error = Error(
          response.right.status === 500 && response.right.value.title
            ? response.right.value.title
            : "Unknown error"
        );
        yield* put(logoutFailure({ error }));
      }
    } else {
      const logoutError = {
        error: Error(readableReport(response.left))
      };
      yield* put(logoutFailure(logoutError));
    }
  } catch (e) {
    const logoutError = {
      error: convertUnknownToError(e)
    };
    yield* put(logoutFailure(logoutError));
  } finally {
    // clean up crypto keys
    yield* deleteCurrentLollipopKeyAndGenerateNewKeyTag();
    // clean up any assistance data
    resetAssistanceData();
    // startApplicationInitialization is dispatched
    // within the componentDidMount of IngressScreen
    yield* put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED));
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
