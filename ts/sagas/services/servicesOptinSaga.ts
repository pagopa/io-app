import { put, select, take } from "redux-saga/effects";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { navigationHistoryPop } from "../../store/actions/navigationHistory";
import { navigateToServicesPreferenceModeSelectionScreen } from "../../store/actions/navigation";
import { profileServicePreferencesModeSelector } from "../../store/reducers/profile";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";

export function* askServicesPreferencesModeOptin(isOnboarding?: true) {
  const profileServicePreferenceMode: ReturnType<typeof profileServicePreferencesModeSelector> = yield select(
    profileServicePreferencesModeSelector
  );
  // if the user is already logged-in and the preference is set, do nothing
  if (
    !isOnboarding &&
    [ServicesPreferencesModeEnum.AUTO, ServicesPreferencesModeEnum.MANUAL].some(
      sp => sp === profileServicePreferenceMode
    )
  ) {
    return;
  }
  yield put(navigateToServicesPreferenceModeSelectionScreen({ isOnboarding }));
  if (isOnboarding) {
    // while on-boarding the selection ends with a thank you screen, remove it from the stack
    yield put(navigationHistoryPop(1));
  }
  // wait until a choice is done by the user
  yield take(servicesOptinCompleted);
}
