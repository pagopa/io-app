import { StackActions } from "@react-navigation/native";
import { call, put } from "typed-redux-saga/macro";
import NavigationService from "../../../../navigation/NavigationService";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { setStartActiveSessionLogin } from "../store/actions";

export function* navigateToActiveSessionLogin() {
  yield* put(setStartActiveSessionLogin());
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.push(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.AUTHENTICATION,
      params: {
        screen: AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN
      }
    })
  );
}
