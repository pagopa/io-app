import { SagaIterator } from "redux-saga";
import { put, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { CommonActions } from "@react-navigation/native";
import {
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import NavigationService from "../../../navigation/NavigationService";
import I18n from "../../../i18n";
import { itwCredentialsAddPid } from "../store/actions/itwCredentialsActions";
import { itwLifecycleValid } from "../store/actions/itwLifecycleActions";

/**
 * Handles the IT wallet credentials related sagas.
 */
export function* watchItwCredentialsSaga(): SagaIterator {
  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

/*
 * This saga handles adding a PID to the wallet.
 * As a side effect, it sets the lifecycle of the wallet to valid.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
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
    yield* put(itwCredentialsAddPid.success(action.payload));
    yield* put(itwLifecycleValid());
  }
}
