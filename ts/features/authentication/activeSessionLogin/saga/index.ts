import {
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
  newTokenActiveSessionLoginSelector
} from "../store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { watchCieAuthenticationSaga } from "../../login/cie/sagas/cie";

export function* watchActiveSessionLoginSaga() {
  yield* takeLatest(
    [getType(setStartActiveSessionLogin), getType(setRetryActiveSessionLogin)],
    handleActiveSessionLoginSaga
  );
}

export function* handleActiveSessionLoginSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
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

    // Even though we are sure that all three values are present at this point,
    // we still need to perform this runtime check due to the lack of strict typing in the reducer state.
    // This is mostly a workaround to satisfy TypeScript.
    // Also note: the `token` is only available *after* success is received,
    // so this check cannot be moved earlier in the flow.
    const isDataComplete = token && idp;

    if (isDataComplete) {
      yield* put(
        consolidateActiveSessionLoginData({
          idp,
          token,
          fastLoginOptIn: !!fastLoginOptIn
        })
      );

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
