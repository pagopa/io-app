import { SagaIterator } from "redux-saga";
import { delay, put, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { CommonActions } from "@react-navigation/native";
import { itwCredentialsAddPid } from "../store/actions";
import {
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import I18n from "../../../i18n";
import NavigationService from "../../../navigation/NavigationService";

/*
 * This saga handles adding new credentials to the wallet.
 * Currenly it consists of a delay and then dispatches the success action, due to the credential being mocked.
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
    yield* delay(2000);
    yield* put(itwCredentialsAddPid.success(action.payload));
  }
}
