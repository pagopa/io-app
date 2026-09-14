import {
  call,
  fork,
  put,
  race,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../../store/actions/analytics";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { ReduxSagaEffect } from "../../../../types/utils";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import {
  trackCieIDLoginSuccess,
  trackCieLoginSuccess,
  trackSpidLoginSuccess
} from "../../common/analytics";
import { updateLoginMethodProfileAndSuperProperties } from "../../common/analytics/spidAnalytics";
import { updateLoginSessionProfileAndSuperProperties } from "../../fastLogin/analytics/optinAnalytics";
import { watchCieAuthenticationSaga } from "../../login/cie/sagas/cie";
import { IdpCIE, IdpCIE_ID } from "../../login/hooks/useNavigateToLoginMethod";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setRetryActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import {
  activeSessionLoginFlowSelector,
  cieIDSelectedSecurityLevelActiveSessionLoginSelector,
  cieLoginFlowSelector,
  idpSelectedActiveSessionLoginSelector,
  isActiveSessionFastLoginEnabledSelector,
  newTokenActiveSessionLoginSelector
} from "../store/selectors";

export function* handleActiveSessionLoginSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const loginFlow = yield* select(cieLoginFlowSelector);

  yield* put(analyticsAuthenticationStarted(loginFlow));

  yield* fork(watchCieAuthenticationSaga);

  const { success, failure } = yield* race({
    success: take(activeSessionLoginSuccess),
    failure: take(activeSessionLoginFailure)
  });

  if (failure) {
    // the failure action are managed into the error screens
    // I decided to keep this code so that we have it ready in case we
    // decide to centralize management in the event of an error here.
    return;
  }

  if (success) {
    const token = yield* select(newTokenActiveSessionLoginSelector);
    const idp = yield* select(idpSelectedActiveSessionLoginSelector);
    const fastLoginOptIn = yield* select(
      isActiveSessionFastLoginEnabledSelector
    );
    const cieIDSelectedSecurityLevel = yield* select(
      cieIDSelectedSecurityLevelActiveSessionLoginSelector
    );

    if (idp && idp.id) {
      switch (idp.id) {
        case IdpCIE.id:
          trackCieLoginSuccess(fastLoginOptIn ? "365" : "30", loginFlow);
          break;
        case IdpCIE_ID.id:
          // We currently request only a Level 2 login; however, once in the CieID app, if the only configured method is a Level 3 login, it will be possible to proceed with that higher level of security.
          // Unfortunately, at the time this event is logged, we do not have information about the actual level used for the recently completed login.
          trackCieIDLoginSuccess(fastLoginOptIn ? "365" : "30", "reauth");
          break;
        default:
          trackSpidLoginSuccess(
            fastLoginOptIn ? "365" : "30",
            idp.id,
            "reauth"
          );
      }
    }

    // Even though we are sure that both values are present at this point,
    // we still need to perform this runtime check due to the lack of strict typing in the reducer state.
    // Also note: the `token` is only available *after* success is received,
    // so this check cannot be moved earlier in the flow.
    if (!token || !idp) {
      return;
    }

    const state: GlobalState = yield* select();
    yield* call(
      updateLoginSessionProfileAndSuperProperties,
      state,
      fastLoginOptIn ? "365" : "30"
    );
    yield* call(updateLoginMethodProfileAndSuperProperties, state, idp.id);

    yield* put(
      consolidateActiveSessionLoginData({
        idp,
        token,
        fastLoginOptIn: !!fastLoginOptIn,
        cieIDSelectedSecurityLevel
      })
    );
    // This event is tracked with the correct LOGIN_SESSION and LOGIN_METHOD
    // because they were just forced in the profile/super properties above.
    // AUTH_SECURITY_LEVEL, however, may be stale: we don't know the actual
    // security level until the session is fetched from the backend
    // (which happens later in initializeApplicationSaga).
    yield* put(analyticsAuthenticationCompleted(loginFlow));

    yield* put(
      startApplicationInitialization({
        handleSessionExpiration: false,
        showIdentificationModalAtStartup: false,
        isActiveLoginSuccess: true
      })
    );
  }
}

export function* handleNavigateAfterFinishedStandardActiveSessionLoginFlow(
  isActiveLoginSuccessProp?: boolean
) {
  const activeSessionLoginFlow = yield* select(activeSessionLoginFlowSelector);

  if (isActiveLoginSuccessProp && activeSessionLoginFlow !== "FCI") {
    // If the user is logging in from the active session login flow, we can be sure that the session is valid
    // and we can directly navigate him to the home screen, skipping all the checks about pending background
    // actions and session expiration blocking screen.
    yield* call(NavigationService.navigate, ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }
  return;
}

export function* watchActiveSessionLoginSaga() {
  yield* takeLatest(
    [getType(setStartActiveSessionLogin), getType(setRetryActiveSessionLogin)],
    handleActiveSessionLoginSaga
  );
}
