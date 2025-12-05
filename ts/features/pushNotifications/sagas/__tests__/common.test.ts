import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../navigation/NavigationService";
import { maybeHandlePendingBackgroundActions } from "../../../../sagas/backgroundActions";
import { navigateToMainNavigatorAction } from "../../../../store/actions/navigation";
import { handleStoredLinkingUrlIfNeeded } from "../../../linking/sagas";
import { resetMessageArchivingAction } from "../../../messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../../../messages/store/reducers/archiving";
import { trackNotificationPermissionsStatus } from "../../analytics";
import { updateSystemNotificationsEnabled } from "../../store/actions/environment";
import { clearNotificationPendingMessage } from "../../store/actions/pendingMessage";
import { areNotificationPermissionsEnabledSelector } from "../../store/reducers/environment";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../../store/reducers/pendingMessage";
import { checkNotificationPermissions } from "../../utils";
import { navigateToMessageRouterAction } from "../../utils/navigation";
import {
  checkAndUpdateNotificationPermissionsIfNeeded,
  handlePushNotificationIfNeeded,
  updateNotificationPermissionsIfNeeded
} from "../common";

describe("maybeHandlePendingBackgroundActions", () => {
  describe("main functionality", () => {
    const generateTestName = (
      linkingUrlHandled: boolean,
      pushNotifHandled: boolean
    ) =>
      `when a linking url is ${
        linkingUrlHandled ? "not " : ""
      }queued to be handled,and a push notification ${
        pushNotifHandled ? "is" : "isn't"
      } queued to be handled, it should terminate after handling the ${
        linkingUrlHandled ? "push notification" : "linking url"
      }`;

    [true, false].forEach(linkingUrlHandled =>
      [true, false].forEach(pushNotifHandled =>
        it(generateTestName(linkingUrlHandled, pushNotifHandled), () => {
          const saga = testSaga(maybeHandlePendingBackgroundActions, false)
            .next()
            .call(handleStoredLinkingUrlIfNeeded)
            .next(linkingUrlHandled);
          if (linkingUrlHandled) {
            saga.isDone();
          } else {
            saga
              .call(handlePushNotificationIfNeeded, false)
              .next(pushNotifHandled)
              .isDone();
          }
        })
      )
    );
  });

  describe("handlePushNotificationIfNeeded", () => {
    const mockedPendingMessageState: PendingMessageState = {
      id: "M01",
      foreground: true
    };

    it("make the app navigate to the message detail when the user press on a notification", () => {
      const dispatchNavigationActionParameter = navigateToMessageRouterAction({
        messageId: mockedPendingMessageState.id,
        fromNotification: true
      });

      testSaga(handlePushNotificationIfNeeded, false)
        .next()
        .select(pendingMessageStateSelector)
        .next(mockedPendingMessageState)
        .put(clearNotificationPendingMessage())
        .next()
        .select(isArchivingDisabledSelector)
        .next(true)
        .call(
          NavigationService.dispatchNavigationAction,
          dispatchNavigationActionParameter
        )
        .next()
        .isDone();
    });

    it("make the app navigate to the message detail when the user press on a notification, resetting the navigation stack before", () => {
      const dispatchNavigationActionParameter = navigateToMessageRouterAction({
        messageId: mockedPendingMessageState.id,
        fromNotification: true
      });

      testSaga(handlePushNotificationIfNeeded, true)
        .next()
        .select(pendingMessageStateSelector)
        .next(mockedPendingMessageState)
        .put(clearNotificationPendingMessage())
        .next()
        .call(navigateToMainNavigatorAction)
        .next()
        .select(isArchivingDisabledSelector)
        .next(true)
        .call(
          NavigationService.dispatchNavigationAction,
          dispatchNavigationActionParameter
        )
        .next()
        .isDone();
    });

    it("make the app navigate to the message detail when the user press on a notification, resetting the message archiving/restoring if such is disabled", () => {
      const dispatchNavigationActionParameter = navigateToMessageRouterAction({
        messageId: mockedPendingMessageState.id,
        fromNotification: true
      });

      testSaga(handlePushNotificationIfNeeded, false)
        .next()
        .select(pendingMessageStateSelector)
        .next(mockedPendingMessageState)
        .put(clearNotificationPendingMessage())
        .next()
        .select(isArchivingDisabledSelector)
        .next(false)
        .put(resetMessageArchivingAction(undefined))
        .next()
        .call(
          NavigationService.dispatchNavigationAction,
          dispatchNavigationActionParameter
        )
        .next()
        .isDone();
    });

    it("does nothing if there are not pending messages", () => {
      testSaga(handlePushNotificationIfNeeded, false)
        .next()
        .select(pendingMessageStateSelector)
        .next(null)
        .next()
        .isDone();
    });
  });
});
describe("updateNotificationPermissionsIfNeeded", () => {
  it("should not call the analytics event and not dispatch 'updateSystemNotificationsEnabled' when system permissions are 'false' and in-memory data are 'false'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, false)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(false)
      .isDone();
  });
  it("should call the analytics event and dispatch 'updateSystemNotificationsEnabled(false)' when system permissions are 'false' and in-memory data are 'true'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, false)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(true)
      .call(trackNotificationPermissionsStatus, false)
      .next()
      .put(updateSystemNotificationsEnabled(false))
      .next()
      .isDone();
  });
  it("should not call the analytics event if 'skipAnalyticsTracking' input is 'true' and dispatch 'updateSystemNotificationsEnabled(false)' when system permissions are 'false' and in-memory data are 'true'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, false, true)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(true)
      .put(updateSystemNotificationsEnabled(false))
      .next()
      .isDone();
  });
  it("should call the analytics event and dispatch 'updateSystemNotificationsEnabled(true)' when system permissions are 'true' and in-memory data are 'false'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(false)
      .call(trackNotificationPermissionsStatus, true)
      .next()
      .put(updateSystemNotificationsEnabled(true))
      .next()
      .isDone();
  });
  it("should not call the analytics event if 'skipAnalyticsTracking' input is 'true' and dispatch 'updateSystemNotificationsEnabled(true)' when system permissions are 'true' and in-memory data are 'false'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, true, true)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(false)
      .put(updateSystemNotificationsEnabled(true))
      .next()
      .isDone();
  });
  it("should not call the analytics event and not dispatch 'updateSystemNotificationsEnabled' when system permissions are 'true' and in-memory data are 'true'", () => {
    testSaga(updateNotificationPermissionsIfNeeded, true)
      .next()
      .select(areNotificationPermissionsEnabledSelector)
      .next(true)
      .isDone();
  });
});

describe("checkAndUpdateNotificationPermissionsIfNeeded", () => {
  it("when 'checkNotificationPermissions' returns 'false', should call 'updateNotificationPermissionsIfNeeded' with ('true', 'false') and return 'false'", () => {
    const systemPermissionsEnabled = false;
    testSaga(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .call(checkNotificationPermissions)
      .next(systemPermissionsEnabled)
      .call(
        updateNotificationPermissionsIfNeeded,
        systemPermissionsEnabled,
        false
      )
      .next()
      .returns(systemPermissionsEnabled)
      .next()
      .isDone();
  });
  it("when 'checkNotificationPermissions' returns 'true', should call 'updateNotificationPermissionsIfNeeded' with ('true', 'false') and return 'true'", () => {
    const systemPermissionsEnabled = true;
    testSaga(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .call(checkNotificationPermissions)
      .next(systemPermissionsEnabled)
      .call(
        updateNotificationPermissionsIfNeeded,
        systemPermissionsEnabled,
        false
      )
      .next()
      .returns(systemPermissionsEnabled)
      .next()
      .isDone();
  });
  it("when 'checkNotificationPermissions' returns 'false' and 'skipAnalyticsTracking' is 'true', should call 'updateNotificationPermissionsIfNeeded' with ('true', 'true') and return 'false'", () => {
    const systemPermissionsEnabled = false;
    testSaga(checkAndUpdateNotificationPermissionsIfNeeded, true)
      .next()
      .call(checkNotificationPermissions)
      .next(systemPermissionsEnabled)
      .call(
        updateNotificationPermissionsIfNeeded,
        systemPermissionsEnabled,
        true
      )
      .next()
      .returns(systemPermissionsEnabled)
      .next()
      .isDone();
  });
  it("when 'checkNotificationPermissions' returns 'true' and 'skipAnalyticsTracking' is 'true', should call 'updateNotificationPermissionsIfNeeded' with ('true', 'true') and return 'true'", () => {
    const systemPermissionsEnabled = true;
    testSaga(checkAndUpdateNotificationPermissionsIfNeeded, true)
      .next()
      .call(checkNotificationPermissions)
      .next(systemPermissionsEnabled)
      .call(
        updateNotificationPermissionsIfNeeded,
        systemPermissionsEnabled,
        true
      )
      .next()
      .returns(systemPermissionsEnabled)
      .next()
      .isDone();
  });
});
