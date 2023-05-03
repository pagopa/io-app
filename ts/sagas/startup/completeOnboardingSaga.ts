import { call, take } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { completeOnboarding } from "../../store/actions/onboarding";

export function* completeOnboardingSaga() {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_COMPLETED
    })
  );

  yield* take(completeOnboarding);
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.popToTop()
  );
}
