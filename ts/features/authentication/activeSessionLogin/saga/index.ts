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
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setRetryActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import {
  isActiveSessionFastLoginEnabledSelector,
  idpSelectedActiveSessionLoginSelector,
  newTokenActiveSessionLoginSelector,
  cieIDSelectedSecurityLevelActiveSessionLoginSelector,
  activeSessionLoginFlowSelector,
  cieLoginFlowSelector
} from "../store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { watchCieAuthenticationSaga } from "../../login/cie/sagas/cie";
import { IdpCIE, IdpCIE_ID } from "../../login/hooks/useNavigateToLoginMethod";
import {
  trackCieLoginSuccess,
  trackCieIDLoginSuccess,
  trackSpidLoginSuccess
} from "../../common/analytics";
import { GlobalState } from "../../../../store/reducers/types";
import { updateLoginSessionProfileAndSuperProperties } from "../../fastLogin/analytics/optinAnalytics";
import { updateLoginMethodProfileProperty } from "../../common/analytics/spidAnalytics";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../../store/actions/analytics";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

export function* watchActiveSessionLoginSaga() {
  yield* takeLatest(
    [getType(setStartActiveSessionLogin), getType(setRetryActiveSessionLogin)],
    handleActiveSessionLoginSaga
  );
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

    // Even though we are sure that all three values are present at this point,
    // we still need to perform this runtime check due to the lack of strict typing in the reducer state.
    // This is mostly a workaround to satisfy TypeScript.
    // Also note: the `token` is only available *after* success is received,
    // so this check cannot be moved earlier in the flow.
    const isDataComplete = token && idp;

    if (isDataComplete) {
      const state = (yield* select()) as GlobalState;
      yield* call(
        updateLoginSessionProfileAndSuperProperties,
        state,
        fastLoginOptIn ? "365" : "30"
      );
      yield* call(updateLoginMethodProfileProperty, state, idp.id);

      yield* put(
        consolidateActiveSessionLoginData({
          idp,
          token,
          fastLoginOptIn: !!fastLoginOptIn,
          cieIDSelectedSecurityLevel
        })
      );

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
}
