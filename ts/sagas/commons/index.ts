import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ActionType, getType } from "typesafe-actions";
import { startApplicationInitialization } from "../../store/actions/application";
import { clearCache } from "../../features/settings/common/store/actions";
import { resetAssistanceData } from "../../utils/supportAssistance";
import {
  requestSessionCorrupted,
  setFinalizeLoggedOutUserWithDifferentCF,
  setLoggedOutUserWithDifferentCF
} from "../../features/authentication/activeSessionLogin/store/actions";
import { backendClientManager } from "../../api/BackendClientManager";
import { apiUrlPrefix } from "../../config";
import {
  logoutFailure,
  newLogoutSuccess,
  sessionCorrupted
} from "../../features/authentication/common/store/actions";
import { sessionTokenSelector } from "../../features/authentication/common/store/selectors";
import { getKeyInfo } from "../../features/lollipop/saga";
import { SagaCallReturnType } from "../../types/utils";
import { convertUnknownToError } from "../../utils/errors";
import { resetMixpanelSaga } from "../mixpanel";

export function* resetAssistanceDataAndClearCache() {
  resetAssistanceData();
  yield* put(clearCache());
}

export function* restartCleanApplication() {
  // clean up any assistance data
  resetAssistanceDataAndClearCache();
  // start again the application
  yield* put(startApplicationInitialization());
}

export function* prova(
  action:
    | ActionType<typeof setLoggedOutUserWithDifferentCF>
    | ActionType<typeof requestSessionCorrupted>
) {
  const sessionToken = yield* select(sessionTokenSelector);
  const keyInfo = yield* call(getKeyInfo);

  if (!sessionToken) {
    return;
  }

  const { logout } = backendClientManager.getBackendClient(
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );

  // Issue a logout request to the backend, asking to delete the session
  // FIXME: if there's no connectivity to the backend, this request will
  //        block for a while.
  try {
    const response: SagaCallReturnType<typeof logout> = yield* call(logout, {});
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(newLogoutSuccess());
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
    // yield* deleteCurrentLollipopKeyAndGenerateNewKeyTag();
    // reset mixpanel
    yield* call(resetMixpanelSaga);
    // clean up any assistance data
    resetAssistanceData();
    if (action.type === getType(setLoggedOutUserWithDifferentCF)) {
      yield* put(setFinalizeLoggedOutUserWithDifferentCF());
    } else {
      yield* put(sessionCorrupted());
      yield* put(startApplicationInitialization());
    }
  }
}
