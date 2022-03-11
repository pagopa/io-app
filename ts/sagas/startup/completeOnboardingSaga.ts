import { call, take } from "typed-redux-saga/macro";
import { NavigationActions } from "react-navigation";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { completeOnboarding } from "../../store/actions/onboarding";

export function* completeOnboardingSaga() {
  yield* call(
    NavigationService.dispatchNavigationAction,
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_COMPLETED
    })
  );

  yield* take(completeOnboarding);
}
