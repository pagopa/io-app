import { CommonActions, StackActions } from "@react-navigation/native";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { requestNotificationPermissions } from "../../utils";
import { notificationsInfoScreenConsent } from "../../store/actions/profileNotificationPermissions";
import { profileAndSystemNotificationsPermissions } from "../profileAndSystemNotificationsPermissions";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import { profileUpsert } from "../../../settings/common/store/actions";
import { PushNotificationsContentTypeEnum } from "../../../../../definitions/backend/PushNotificationsContentType";
import { ReminderStatusEnum } from "../../../../../definitions/backend/ReminderStatus";
import {
  trackNotificationsOptInPreviewStatus,
  trackNotificationsOptInReminderStatus,
  trackPushNotificationSystemPopupShown
} from "../../analytics";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import {
  checkAndUpdateNotificationPermissionsIfNeeded,
  updateNotificationPermissionsIfNeeded
} from "../common";
import { setPushPermissionsRequestDuration } from "../../store/actions/environment";
import { hasUserSeenSystemNotificationsPromptSelector } from "../../store/selectors";

const generateUserProfile = (
  hasDoneNotificationOptIn: boolean,
  isFirstOnboarding: boolean
) =>
  ({
    push_notifications_content_type: hasDoneNotificationOptIn
      ? PushNotificationsContentTypeEnum.FULL
      : undefined,
    reminder_status: hasDoneNotificationOptIn
      ? ReminderStatusEnum.ENABLED
      : undefined,
    service_preferences_settings: {
      mode: isFirstOnboarding
        ? ServicesPreferencesModeEnum.LEGACY
        : ServicesPreferencesModeEnum.AUTO
    }
  } as InitializedProfile);

const profileUpsertResult = () => ({
  payload: {
    newValue: {
      push_notifications_content_type: PushNotificationsContentTypeEnum.FULL,
      reminder_status: ReminderStatusEnum.ENABLED
    }
  }
});

describe("checkNotificationsPreferencesSaga", () => {
  it("profile without notification settings, missing service configuration, device has no notification permissions, gives  device notification permissions", () => {
    const profile = generateUserProfile(false, true);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
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
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(true)
      .call(trackPushNotificationSystemPopupShown)
      .next()
      .call(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile without notification settings, missing service configuration, device has no notification permissions, denies device notification permissions", () => {
    const profile = generateUserProfile(false, true);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
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
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(false)
      .call(performance.now)
      .next(10)
      .put(setPushPermissionsRequestDuration(10))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(false)
      .call(updateNotificationPermissionsIfNeeded, false)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      )
      .next()
      .take(notificationsInfoScreenConsent)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.pop())
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile without notification settings, missing service configuration, device has    notification permissions", () => {
    const profile = generateUserProfile(false, true);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
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
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(true)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile has     notification settings, missing service configuration, device has no notification permissions, gives  device notification permissions", () => {
    const profile = generateUserProfile(true, true);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(true)
      .call(trackPushNotificationSystemPopupShown)
      .next()
      .call(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
  it("profile has     notification settings, missing service configuration, device has no notification permissions, denies device notification permissions", () => {
    const profile = generateUserProfile(true, true);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(false)
      .call(performance.now)
      .next(10)
      .put(setPushPermissionsRequestDuration(10))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(false)
      .call(updateNotificationPermissionsIfNeeded, false)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
  it("profile has     notification settings, missing service configuration, device has    notification permissions", () => {
    const profile = generateUserProfile(true, true);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(true)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
  it("profile without notification settings, has     service configuration, device has no notification permissions, gives  device notification permissions", () => {
    const profile = generateUserProfile(false, false);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: false }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(true)
      .call(trackPushNotificationSystemPopupShown)
      .next()
      .call(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile without notification settings, has     service configuration, device has no notification permissions, denies device notification permissions", () => {
    const profile = generateUserProfile(false, false);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: false }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(false)
      .call(performance.now)
      .next(10)
      .put(setPushPermissionsRequestDuration(10))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(false)
      .call(updateNotificationPermissionsIfNeeded, false)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      )
      .next()
      .take(notificationsInfoScreenConsent)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.pop())
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile without notification settings, has     service configuration, device has    notification permissions", () => {
    const profile = generateUserProfile(false, false);
    const profileUpsertOutput = profileUpsertResult();
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
          params: { isFirstOnboarding: false }
        })
      )
      .next()
      .take(profileUpsert.success)
      .next(profileUpsertOutput)
      .call(
        trackNotificationsOptInPreviewStatus,
        profileUpsertOutput.payload.newValue.push_notifications_content_type
      )
      .next()
      .call(
        trackNotificationsOptInReminderStatus,
        profileUpsertOutput.payload.newValue.reminder_status
      )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(true)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .call(NavigationService.dispatchNavigationAction, StackActions.popToTop())
      .next()
      .isDone();
  });
  it("profile has     notification settings, has     service configuration, device has no notification permissions, gives  device notification permissions", () => {
    const profile = generateUserProfile(true, false);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(true)
      .call(trackPushNotificationSystemPopupShown)
      .next()
      .call(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
  it("profile has     notification settings, has     service configuration, device has no notification permissions, denies device notification permissions", () => {
    const profile = generateUserProfile(true, false);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(false)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(false)
      .call(performance.now)
      .next(10)
      .put(setPushPermissionsRequestDuration(10))
      .next()
      .select(hasUserSeenSystemNotificationsPromptSelector)
      .next(false)
      .call(updateNotificationPermissionsIfNeeded, false)
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
  it("profile has     notification settings, has     service configuration, device has    notification permissions", () => {
    const profile = generateUserProfile(true, false);
    const globalState = {};
    testSaga(profileAndSystemNotificationsPermissions, profile)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next(true)
      .call(performance.now)
      .next(0)
      .call(requestNotificationPermissions)
      .next(true)
      .call(performance.now)
      .next(1000)
      .put(setPushPermissionsRequestDuration(1000))
      .next()
      .select()
      .next(globalState)
      .call(updateMixpanelSuperProperties, globalState)
      .next()
      .call(updateMixpanelProfileProperties, globalState)
      .next()
      .isDone();
  });
});
