import { call, select, take } from "typed-redux-saga/macro";
import { StackActions } from "@react-navigation/native";
import { navigateToServicesPreferenceModeSelectionScreen } from "../../store/actions/navigation";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import {
  isServicesPreferenceModeSet,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";
import NavigationService from "../../navigation/NavigationService";

/**
 * if the current profile has not services preference mode set
 * navigate to a screen where he/she can make a choice
 * @param isFirstOnboarding
 */
export function* askServicesPreferencesModeOptin(isFirstOnboarding: boolean) {
  const profileServicePreferenceMode: ReturnType<
    typeof profileServicePreferencesModeSelector
  > = yield* select(profileServicePreferencesModeSelector);
  // if the user's preference is set, do nothing
  if (isServicesPreferenceModeSet(profileServicePreferenceMode)) {
    return;
  }
  yield* call(navigateToServicesPreferenceModeSelectionScreen, {
    isFirstOnboarding
  });
  // wait until a choice is done by the user
  yield* take(servicesOptinCompleted);
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.popToTop()
  );
}
