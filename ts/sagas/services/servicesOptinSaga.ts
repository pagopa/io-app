import { put, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import ROUTES from "../../navigation/routes";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import { navigationHistoryPop } from "../../store/actions/navigationHistory";

export function* askServicesOptin() {
  // TODO Check if the User already set this information
  yield put(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SERVICES_PREFERENCE
    })
  );

  yield take(servicesOptinCompleted);
}

export function* askOldUsersServicesOptin() {
  yield put(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SERVICES_PREFERENCE,
      params: { isOldUser: true }
    })
  );
  yield put(navigationHistoryPop(1));

  yield take(servicesOptinCompleted);
}
