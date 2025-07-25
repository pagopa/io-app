import { put, race, select, take } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData
} from "../store/actions";
import {
  fastLoginOptInActiveSessionLoginSelector,
  idpSelectedActiveSessionLoginSelector,
  newTokenActiveSessionLoginSelector
} from "../store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";

export function* handleActiveSessionLoginSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const { success, failure } = yield* race({
    success: take(activeSessionLoginSuccess),
    failure: take(activeSessionLoginFailure)
  });

  if (failure) {
    // console.log("handleActiveSessionLoginSaga failure");
    return;
  }

  if (success) {
    // console.log("handleActiveSessionLoginSaga success");
    const newTokenActiveSessionLogin = yield* select(
      newTokenActiveSessionLoginSelector
    );
    const idpSelectedActiveSessionLogin = yield* select(
      idpSelectedActiveSessionLoginSelector
    );

    const fastLoginOptInActiveSessionLogin = yield* select(
      fastLoginOptInActiveSessionLoginSelector
    );
    if (
      idpSelectedActiveSessionLogin &&
      newTokenActiveSessionLogin &&
      fastLoginOptInActiveSessionLogin !== undefined
    ) {
      yield* put(
        consolidateActiveSessionLoginData({
          idp: idpSelectedActiveSessionLogin,
          token: newTokenActiveSessionLogin,
          fastLoginOptIn: fastLoginOptInActiveSessionLogin
        })
      );
    }
    // TODO: fix isActiveLoginSuccess
    yield* put(
      startApplicationInitialization({
        handleSessionExpiration: false,
        showIdentificationModalAtStartup: false,
        isActiveLoginSuccess: true
      })
    );
  }
}
