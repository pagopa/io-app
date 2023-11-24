import { CommonActions } from "@react-navigation/native";
import { isActionOf } from "typesafe-actions";
import { put, take } from "typed-redux-saga/macro";
import NavigationService from "../../../navigation/NavigationService";
import {
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import I18n from "../../../i18n";

/**
 * Generator function that handles the PIN verification.
 * Throws an error if the identification fails.
 */
export function* verifyPin() {
  yield* put(
    identificationRequest(false, true, undefined, {
      label: I18n.t("global.buttons.cancel"),
      onCancel: () =>
        NavigationService.dispatchNavigationAction(CommonActions.goBack())
    })
  );

  const res = yield* take(identificationSuccess);

  if (!isActionOf(identificationSuccess, res)) {
    throw new Error(); // TODO: needs to be mapped to an ITW error type in the future (SIW-713)
  }
}
