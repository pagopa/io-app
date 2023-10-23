import { SagaIterator } from "redux-saga";
import { put, take, takeLatest, select, call } from "typed-redux-saga/macro";
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
  itwCredentialsAddCredential,
  itwCredentialsAddPid,
  itwCredentialsChecks
} from "../store/actions/itwCredentialsActions";
import { itwLifecycleValid } from "../store/actions/itwLifecycleActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { itwCredentialsSelector } from "../store/reducers/itwCredentialsReducer";
import ROUTES from "../../../navigation/routes";
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
  /**
   * Handles the request to add credential into the wallet.
   */
  yield* takeLatest(
    itwCredentialsAddCredential.request,
    handleCredentialsAddCredential
  );
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
  // TODO: Implement the required checks. Currently it just checks if the credential is already existing with a loose comparison on the title.
  const credential = action.payload;
  const credentialsOptions = yield* select(itwCredentialsSelector);
  const isFound = credentialsOptions
    .filter(O.isSome)
    .some(e => e.value.title === credential.title);

  if (!isFound) {
    yield* put(itwCredentialsChecks.success(action.payload));
  } else {
    yield* put(
      itwCredentialsChecks.failure({
        code: ItWalletErrorTypes.CREDENTIAL_ALREADY_EXISTING_ERROR
      })
    );
  }
}

/**
 * This saga handles the request to add a credential to the wallet.
 * NOTE: Currently it just returns true as we are only handling a mocked credential.
 * @param action the request dispatched action with a credential as payload.
 */
export function* handleCredentialsAddCredential(
  action: ActionType<typeof itwCredentialsAddCredential.request>
): SagaIterator {
  yield* put(
    identificationRequest(false, true, undefined, {
      label: I18n.t("global.buttons.cancel"),
      onCancel: () =>
        NavigationService.dispatchNavigationAction(CommonActions.goBack())
    })
  );

  const res = yield* take(identificationSuccess);

  if (isActionOf(identificationSuccess, res)) {
    yield* put(itwCredentialsAddCredential.success(action.payload));
    yield* put(itwLifecycleValid());
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.navigate(ROUTES.MAIN, {
        screen: ROUTES.MESSAGES_HOME
      })
    );
  } else {
    yield* put(
      itwCredentialsAddCredential.failure({
        code: ItWalletErrorTypes.CREDENTIALS_ADD_ERROR
      })
    );
  }
}
