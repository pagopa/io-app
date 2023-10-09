import { SagaIterator } from "redux-saga";
import { put, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { CommonActions } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import {
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import NavigationService from "../../../navigation/NavigationService";
import I18n from "../../../i18n";
import {
  itwCredentialsAddPid,
  itwCredentialsChecks
} from "../store/actions/itwCredentialsActions";
import { itwLifecycleValid } from "../store/actions/itwLifecycleActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";

/**
 * Handles the IT wallet credentials related sagas.
 */
export function* watchItwCredentialsSaga(): SagaIterator {
  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
  /**
   * Handles the required checks before adding a credential.
   */
  yield* takeLatest(itwCredentialsChecks.request, handleCredentialsChecks);
}

/*
 * This saga handles adding a PID to the wallet.
 * As a side effect, it sets the lifecycle of the wallet to valid.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
): SagaIterator {
  const pid = action.payload;
  if (O.isSome(pid)) {
    yield* put(
      identificationRequest(false, true, undefined, {
        label: I18n.t("global.buttons.cancel"),
        onCancel: () =>
          NavigationService.dispatchNavigationAction(CommonActions.goBack())
      })
    );

    const res = yield* take(identificationSuccess);

    if (isActionOf(identificationSuccess, res)) {
      yield* put(itwCredentialsAddPid.success(pid.value));
      yield* put(itwLifecycleValid());
    }
  } else {
    yield* put(
      itwCredentialsAddPid.failure({
        code: ItWalletErrorTypes.CREDENTIALS_ADD_ERROR
      })
    );
  }
}

/**
 * This saga handles the required checks before adding a credential.
 * @param action the request dispatched action with a credential as payload.
 */
export function* handleCredentialsChecks(
  action: ActionType<typeof itwCredentialsChecks.request>
): SagaIterator {
  // TODO: Implement the required checks. Currently it just returns the same credential as we are only handling a mocked credential.
  yield* put(itwCredentialsChecks.success(action.payload));
}
