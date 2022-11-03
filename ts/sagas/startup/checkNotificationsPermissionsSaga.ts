import { CommonActions } from "@react-navigation/native";
import { call, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { isProfileFirstOnBoarding } from "../../store/reducers/profile";
import { notificationsInfoScreenConsent } from "../../store/actions/notifications";
import { SagaCallReturnType } from "../../types/utils";
import {
  AuthorizationStatus,
  checkNotificationPermissions,
  requestNotificationPermissions
} from "../../utils/notification";

export function* checkNotificationsPermissionsSaga(
  userProfile: InitializedProfile
) {
  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);

  const authorizationStatus: SagaCallReturnType<
    typeof checkNotificationPermissions
  > = yield* call(checkNotificationPermissions);

  if (!authorizationStatus) {
    if (isFirstOnboarding) {
      const {
        authorizationStatus
      }: SagaCallReturnType<typeof requestNotificationPermissions> =
        yield* call(requestNotificationPermissions);

      if (authorizationStatus === AuthorizationStatus.Authorized) {
        return;
      }
    }
    
    yield* call(
      NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
    );

    yield* take<ActionType<typeof notificationsInfoScreenConsent>>(
      notificationsInfoScreenConsent
    );
  }
}
