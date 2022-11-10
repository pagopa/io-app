import { testSaga } from "redux-saga-test-plan";
import { CommonActions } from "@react-navigation/native";
import { checkNotificationsPermissionsSaga } from "../checkNotificationsPermissionsSaga";
import {
  AuthorizationStatus,
  checkNotificationPermissions,
  requestNotificationPermissions
} from "../../../utils/notification";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { notificationsInfoScreenConsent } from "../../../store/actions/notifications";

describe("checkNotificationsPermissionsSaga", () => {
  it("upon saga startup, it should ask for push notifications permission", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions);
  });

  it("if the push notifications permission was given, the saga will terminate ", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions)
      .next(true)
      .isDone();
  });

  it("if the push notifications permission was not given, the saga will request push notification permissions", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions);
  });

  it("if the saga asks for push permissions and the user give them, the saga will terminate", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next({ authorizationStatus: AuthorizationStatus.Authorized })
      .isDone();
  });

  it("if the saga asks for push permissions and the user does not give them, the saga navigates to the Info Screen and waits for the notificationsInfoScreenConsent action", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next({ authorizationStatus: AuthorizationStatus.StatusDenied })
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      )
      .next()
      .take(notificationsInfoScreenConsent);
  });

  it("if the saga is waiting for the notificationsInfoScreenConsent action and the latter is received, the saga terminates", () => {
    testSaga(checkNotificationsPermissionsSaga)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next({ authorizationStatus: AuthorizationStatus.StatusDenied })
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      )
      .next()
      .take(notificationsInfoScreenConsent)
      .next()
      .isDone();
  });
});
