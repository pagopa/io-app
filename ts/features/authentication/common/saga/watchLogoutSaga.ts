import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";

import { call, put, takeLatest, select } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import {
  deleteCurrentLollipopKeyAndGenerateNewKeyTag,
  getKeyInfo
} from "../../../lollipop/saga";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { logoutFailure, logoutRequest, logoutSuccess } from "../store/actions";
import { startupLoadSuccess } from "../../../../store/actions/startup";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { resetAssistanceData } from "../../../../utils/supportAssistance";
import { StartupStatusEnum } from "../../../../store/reducers/startup";
import { resetMixpanelSaga } from "../../../../sagas/mixpanel";
import { backendClientManager } from "../../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../../config";
import { bareSessionTokenSelector } from "../store/selectors";

// eslint-disable-next-line sonarjs/cognitive-complexity
export function* logoutSaga({ payload }: ActionType<typeof logoutRequest>) {
  const sessionToken = yield* select(bareSessionTokenSelector);
  const keyInfo = yield* call(getKeyInfo);

  if (!sessionToken) {
    // TODO: add MP tech event https://pagopa.atlassian.net/browse/IOPID-3528
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
    if (payload.withApiCall) {
      const response: SagaCallReturnType<typeof logout> = yield* call(
        logout,
        {}
      );
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
    } else {
      yield* put(logoutSuccess());
    }
  } catch (e) {
    const logoutError = {
      error: convertUnknownToError(e)
    };
    yield* put(logoutFailure(logoutError));
  } finally {
    // clean up crypto keys
    yield* deleteCurrentLollipopKeyAndGenerateNewKeyTag();
    // reset mixpanel
    yield* call(resetMixpanelSaga);
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
export function* watchLogoutSaga() {
  yield* takeLatest(getType(logoutRequest), logoutSaga);
}
