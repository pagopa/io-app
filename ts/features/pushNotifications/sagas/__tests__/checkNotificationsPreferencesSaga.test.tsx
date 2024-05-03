import { CommonActions, StackActions } from "@react-navigation/native";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import {
  checkNotificationPermissions,
  requestNotificationPermissions
} from "../../utils";
import { notificationsInfoScreenConsent } from "../../store/actions/notifications";
import { checkNotificationsPreferencesSaga } from "../checkNotificationsPreferencesSaga";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import { profileUpsert } from "../../../../store/actions/profile";
import { PushNotificationsContentTypeEnum } from "../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../definitions/backend/ReminderStatus";

const userProfile = {
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.LEGACY
  }
} as InitializedProfile;

describe("checkNotificationsPreferencesSaga", () => {
  it("upon saga startup, it should ask for push notifications permission", () => {
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions);
  });

  it("if the push notifications permission was given, the saga will terminate ", () => {
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions)
      .next(true)
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });

  it("if the push notifications permission was not given and is first onboarding, the saga will request push notification permissions", () => {
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions);
  });

  it("if the saga asks for push permissions and the user give them, the saga will terminate", () => {
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next(true)
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });

  it("if the saga asks for push permissions and the user does not give them, the saga navigates to the Info Screen and waits for the notificationsInfoScreenConsent action", () => {
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next(false)
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
    testSaga(checkNotificationsPreferencesSaga, userProfile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: true }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next({
        payload: {
          newValue: {
            push_notifications_content_type:
              PushNotificationsContentTypeEnum.FULL,
            reminder_status: ReminderStatusEnum.ENABLED
          }
        }
      })
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next(false)
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      )
      .next()
      .take(notificationsInfoScreenConsent)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
});
