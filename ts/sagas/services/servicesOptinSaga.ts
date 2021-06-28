import { put, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import ROUTES from "../../navigation/routes";
import { servicesOptinCompleted } from "../../store/actions/onboarding";

export function* askServicesOptin() {
  // TODO Check if the User already set this information

  yield put(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SERVICES_PREFERENCE
    })
  );

  yield take(servicesOptinCompleted);
}
