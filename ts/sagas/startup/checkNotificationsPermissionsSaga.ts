import { CommonActions, StackActions } from "@react-navigation/native";
import { call, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { notificationsInfoScreenConsent } from "../../store/actions/notifications";
import { SagaCallReturnType } from "../../types/utils";
import {
  checkNotificationPermissions,
  requestNotificationPermissions
} from "../../utils/notification";

export function* checkNotificationsPermissionsSaga() {
  const authorizationStatus: SagaCallReturnType<
    typeof checkNotificationPermissions
  > = yield* call(checkNotificationPermissions);

  if (!authorizationStatus) {
    const permissionStatus: SagaCallReturnType<
      typeof requestNotificationPermissions
    > = yield* call(requestNotificationPermissions);

    if (permissionStatus) {
      return;
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

    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
  }
}
