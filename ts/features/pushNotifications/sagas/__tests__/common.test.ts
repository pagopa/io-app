import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../../../navigation/NavigationService";
import { navigateToMainNavigatorAction } from "../../../../store/actions/navigation";
import { clearLinkingUrl } from "../../../linking/actions";
import { storedLinkingUrlSelector } from "../../../linking/reducers";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { resetMessageArchivingAction } from "../../../messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../../../messages/store/reducers/archiving";
import { isSendAARLink } from "../../../pn/aar/utils/deepLinking";
import PN_ROUTES from "../../../pn/navigation/routes";
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
  maybeHandlePendingBackgroundActions,
  updateNotificationPermissionsIfNeeded
} from "../common";

describe("maybeHandlePendingBackgroundActions", () => {
  describe("stored linkinkg url handling", () => {
    const aarUrl = "https://example.com/aar";
    it("should navigate to the AAR screen and clear the linking url state when there is a valid AAR url returned by the linking selector", () => {
      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(aarUrl)
        .select(isSendAARLink, aarUrl)
        .next(true)
        .call(NavigationService.navigate, MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl }
          }
        })
        .next()
        .put(clearLinkingUrl())
        .next()
        .isDone();
    });
    it("should not do any navigation or clear the linking url state when there is an unrecognized url stored in the linking selector", () => {
      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(aarUrl)
        .select(isSendAARLink, aarUrl)
        .next(false)
        .select(pendingMessageStateSelector); // this selector call marks the start of the next test suite
      // from here on, the saga should behave as in the "handle pending notification messages" test suite
    });
    it("should do nothing if no linking url is stored", () => {
      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(undefined)
        .select(pendingMessageStateSelector); // this selector call marks the start of the next test suite
      // from here on, the saga should behave as in the "handle pending notification messages" test suite
    });
  });

  describe("handle pending notification messages", () => {
    const mockedPendingMessageState: PendingMessageState = {
      id: "M01",
      foreground: true
    };

    it("make the app navigate to the message detail when the user press on a notification", () => {
      const dispatchNavigationActionParameter = navigateToMessageRouterAction({
        messageId: mockedPendingMessageState.id,
        fromNotification: true
      });

      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(undefined)
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

      testSaga(maybeHandlePendingBackgroundActions, true)
        .next()
        .select(storedLinkingUrlSelector)
        .next(undefined)
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

      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(undefined)
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
      testSaga(maybeHandlePendingBackgroundActions, false)
        .next()
        .select(storedLinkingUrlSelector)
        .next(undefined)
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
