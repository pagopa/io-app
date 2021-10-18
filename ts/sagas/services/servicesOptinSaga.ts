import { put, select, take } from "redux-saga/effects";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { navigationHistoryPop } from "../../store/actions/navigationHistory";
import { navigateToServicesPreferenceModeSelectionScreen } from "../../store/actions/navigation";
import {
  isServicesPreferenceModeSet,
  profileServicePreferencesModeSelector
} from "../../store/reducers/profile";

/**
 * if the current profile has not services preference mode set
 * navigate to a screen where he/she can make a choice
 * @param isFirstOnboarding
 */
export function* askServicesPreferencesModeOptin(isFirstOnboarding: boolean) {
  const profileServicePreferenceMode: ReturnType<
    typeof profileServicePreferencesModeSelector
  > = yield select(profileServicePreferencesModeSelector);
  // if the user's preference is set, do nothing
  if (isServicesPreferenceModeSet(profileServicePreferenceMode)) {
    return;
  }
  yield put(
    navigateToServicesPreferenceModeSelectionScreen({ isFirstOnboarding })
  );
  if (!isFirstOnboarding) {
    // for existing users the selection ends with a thank you screen, remove it from the stack
    yield put(navigationHistoryPop(1));
  }
  // wait until a choice is done by the user
  yield take(servicesOptinCompleted);
}
