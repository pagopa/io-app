import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { backendClientManager } from "../../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../../config";
import { resetMixpanelSaga } from "../../../../sagas/mixpanel";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { resetAssistanceData } from "../../../../utils/supportAssistance";
import {
  deleteCurrentLollipopKeyAndGenerateNewKeyTag,
  getKeyInfo
} from "../../../lollipop/saga";
import {
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../../../messages/analytics";
import { trackLogoutFailure, trackLogoutSuccess } from "../../common/analytics";
import { sessionCorrupted } from "../../common/store/actions";
import { sessionTokenSelector } from "../../common/store/selectors";
import {
  logoutBeforeSessionCorrupted,
  setFinalizeLoggedOutUserWithDifferentCF,
  setLoggedOutUserWithDifferentCF
} from "../store/actions";

export function* logoutUserAfterActiveSessionLoginSaga(
  action:
    | ActionType<typeof logoutBeforeSessionCorrupted>
    | ActionType<typeof setLoggedOutUserWithDifferentCF>
) {
  const sessionToken = yield* select(sessionTokenSelector);
  const keyInfo = yield* call(getKeyInfo);

  if (!sessionToken) {
    trackUndefinedBearerToken(
      UndefinedBearerTokenPhase.activeSessionLoginLogout
    );
    return;
  }

  const { logout } = backendClientManager.getBackendClient(
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );

  try {
    const response: SagaCallReturnType<typeof logout> = yield* call(logout, {});
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        trackLogoutSuccess("reauth");
      } else {
        // We got an error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
        const error = Error(
          response.right.status === 500 && response.right.value.title
            ? response.right.value.title
            : "Unknown error"
        );
        trackLogoutFailure(error, "reauth");
      }
    } else {
      trackLogoutFailure(Error(readableReport(response.left)), "reauth");
    }
  } catch (e) {
    trackLogoutFailure(convertUnknownToError(e), "reauth");
  } finally {
    // clean up crypto keys
    yield* deleteCurrentLollipopKeyAndGenerateNewKeyTag();
    // clean up any assistance data
    resetAssistanceData();
    // Always finalize the session, regardless of logout API result
    if (action.type === getType(setLoggedOutUserWithDifferentCF)) {
      yield* put(setFinalizeLoggedOutUserWithDifferentCF());
      yield* call(resetMixpanelSaga);
    } else {
      yield* put(sessionCorrupted());
      yield* call(resetMixpanelSaga);
      yield* put(startApplicationInitialization());
    }
  }
}

export function* watchForceLogoutActiveSessionLogin(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    [
      getType(setLoggedOutUserWithDifferentCF),
      getType(logoutBeforeSessionCorrupted)
    ],
    logoutUserAfterActiveSessionLoginSaga
  );
}
