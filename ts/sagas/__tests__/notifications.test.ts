import * as E from "fp-ts/lib/Either";
import { Action } from "redux";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import {
  handlePendingMessageStateIfAllowedSaga,
  notificationsPlatform,
  trackMessageNotificationTapIfNeeded,
  updateInstallationSaga
} from "../notifications";

import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../store/actions/authentication";
import {
  clearNotificationPendingMessage,
  notificationsInstallationTokenRegistered,
  updateNotificationsInstallationToken
} from "../../store/actions/notifications";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../../store/reducers/notifications/pendingMessage";
import NavigationService from "../../navigation/NavigationService";
import { isPaymentOngoingSelector } from "../../store/reducers/wallet/payment";
import { navigateToMainNavigatorAction } from "../../store/actions/navigation";
import { navigateToMessageRouterAction } from "../../features/messages/store/actions/navigation";
import { UIMessageId } from "../../features/messages/types";
import * as Analytics from "../../features/messages/analytics";

const installationId = "installationId";
jest.mock("../../utils/installation", () => ({
  generateInstallationId: () => installationId
}));

describe("updateInstallationSaga", () => {
  const updateState = (
    actions: ReadonlyArray<Action>,
    currentState: ReturnType<typeof appReducer> | undefined = undefined
  ) => actions.reduce((acc, curr) => appReducer(acc, curr), currentState);

  describe("when the store is empty and the push notification token is not stored yet", () => {
    it("then it should check and do nothing", () => {
      const globalState = updateState([applicationChangeState("active")]);
      const createOrUpdateInstallation = jest.fn();
      void expectSaga(updateInstallationSaga, createOrUpdateInstallation)
        .withState(globalState)
        .returns(undefined)
        .run();
    });
  });

  describe("when push notification token is available and saved in the store", () => {
    const pushNotificationToken = "googleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken)
    ]);
    describe("and no previous token is been sent to the backend", () => {
      const createOrUpdateInstallation = jest.fn();

      it("then it should send it to the backend", () =>
        expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(globalState)
          .provide([
            [
              matchers.call.fn(createOrUpdateInstallation),
              E.right({ status: 200 })
            ]
          ])
          .call(createOrUpdateInstallation, {
            installationID: installationId,
            body: {
              platform: notificationsPlatform,
              pushChannel: pushNotificationToken
            }
          })
          .put(notificationsInstallationTokenRegistered(pushNotificationToken))
          .run());
    });
  });

  describe("when push notification token is available and saved in the store and it is already sent to the backend", () => {
    const pushNotificationToken = "googleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken),
      notificationsInstallationTokenRegistered(pushNotificationToken)
    ]);

    describe("and it doesn't change", () => {
      it("the it should not send the push notification token to the backend", () => {
        const localState = updateState(
          [notificationsInstallationTokenRegistered(pushNotificationToken)],
          globalState
        );
        const createOrUpdateInstallation = jest.fn();
        return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(localState)
          .returns(undefined)
          .run();
      });
    });

    describe("and it changes", () => {
      const newPushNotificationToken = "newGoogleOrApplePushNotificationToken";
      it("should send the push notification token to the backend", () => {
        const localState = updateState(
          [updateNotificationsInstallationToken(newPushNotificationToken)],
          globalState
        );
        const createOrUpdateInstallation = jest.fn();
        return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(localState)
          .provide([
            [
              matchers.call.fn(createOrUpdateInstallation),
              E.right({ status: 200 })
            ]
          ])
          .call(createOrUpdateInstallation, {
            installationID: installationId,
            body: {
              platform: notificationsPlatform,
              pushChannel: newPushNotificationToken
            }
          })
          .put(
            notificationsInstallationTokenRegistered(newPushNotificationToken)
          )
          .run();
      });
    });

    describe("and the user did logout", () => {
      it("should send the push notification token", () => {
        const localState = updateState([logoutRequest()], globalState);
        const createOrUpdateInstallation = jest.fn();
        return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(localState)
          .provide([
            [
              matchers.call.fn(createOrUpdateInstallation),
              E.right({ status: 200 })
            ]
          ])
          .call(createOrUpdateInstallation, {
            installationID: installationId,
            body: {
              platform: notificationsPlatform,
              pushChannel: pushNotificationToken
            }
          })
          .put(notificationsInstallationTokenRegistered(pushNotificationToken))
          .run();
      });
    });

    describe("and the session expires", () => {
      it("should send the push notification token", () => {
        const localState = updateState([sessionExpired()], globalState);
        const createOrUpdateInstallation = jest.fn();
        return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(localState)
          .provide([
            [
              matchers.call.fn(createOrUpdateInstallation),
              E.right({ status: 200 })
            ]
          ])
          .call(createOrUpdateInstallation, {
            installationID: installationId,
            body: {
              platform: notificationsPlatform,
              pushChannel: pushNotificationToken
            }
          })
          .put(notificationsInstallationTokenRegistered(pushNotificationToken))
          .run();
      });
    });

    describe("and the session becomes invalid", () => {
      it("should send the push notification token", () => {
        const pushNotificationToken = "newGoogleOrApplePushNotificationToken";
        const globalState = updateState([
          applicationChangeState("active"),
          updateNotificationsInstallationToken(pushNotificationToken),
          notificationsInstallationTokenRegistered(pushNotificationToken),
          sessionInvalid()
        ]);
        const createOrUpdateInstallation = jest.fn();
        return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
          .withState(globalState)
          .provide([
            [
              matchers.call.fn(createOrUpdateInstallation),
              E.right({ status: 200 })
            ]
          ])
          .call(createOrUpdateInstallation, {
            installationID: installationId,
            body: {
              platform: notificationsPlatform,
              pushChannel: pushNotificationToken
            }
          })
          .put(notificationsInstallationTokenRegistered(pushNotificationToken))
          .run();
      });
    });
  });
});

describe("handlePendingMessageStateIfAllowedSaga", () => {
  const mockedPendingMessageState: PendingMessageState = {
    id: "M01",
    foreground: true,
    trackEvent: false
  };

  it("make the app navigate to the message detail when the user press on a notification", () => {
    const dispatchNavigationActionParameter = navigateToMessageRouterAction({
      messageId: mockedPendingMessageState.id as UIMessageId,
      fromNotification: true
    });

    testSaga(handlePendingMessageStateIfAllowedSaga, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .call(trackMessageNotificationTapIfNeeded, mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .put(clearNotificationPendingMessage())
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        dispatchNavigationActionParameter
      )
      .next()
      .isDone();
  });

  it("make the app navigate to the message detail when the user press on a notification, resetting the navigation stack before", () => {
    const dispatchNavigationActionParameter = navigateToMessageRouterAction({
      messageId: mockedPendingMessageState.id as UIMessageId,
      fromNotification: true
    });

    testSaga(handlePendingMessageStateIfAllowedSaga, true)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .call(trackMessageNotificationTapIfNeeded, mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .put(clearNotificationPendingMessage())
      .next()
      .call(navigateToMainNavigatorAction)
      .next()
      .call(
        NavigationService.dispatchNavigationAction,
        dispatchNavigationActionParameter
      )
      .next()
      .isDone();
  });

  it("does nothing if there is a payment going on", () => {
    testSaga(handlePendingMessageStateIfAllowedSaga, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(mockedPendingMessageState)
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .isDone();
  });

  it("does nothing if there are not pending messages", () => {
    testSaga(handlePendingMessageStateIfAllowedSaga, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(null)
      .next()
      .select(isPaymentOngoingSelector)
      .next(false)
      .isDone();
  });

  it("does nothing if there are not pending messages and there is a payment going on", () => {
    testSaga(handlePendingMessageStateIfAllowedSaga, false)
      .next()
      .select(pendingMessageStateSelector)
      .next(null)
      .next()
      .select(isPaymentOngoingSelector)
      .next(true)
      .isDone();
  });
});

describe("trackMessageNotificationTapIfNeeded", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should call trackMessageNotificationTap when there is a PendingMessageState that requires tracking", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(_ => Promise.resolve());
    const mockPendingMessageState = {
      id: "001",
      foreground: true,
      trackEvent: true
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).toBeCalledWith("001");
  });
  it("should not call trackMessageNotificationTap when there is a PendingMessageState that does not require tracking", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(_ => Promise.resolve());
    const mockPendingMessageState = {
      id: "001",
      foreground: true,
      trackEvent: false
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
  it("should not call trackMessageNotificationTap when there is a PendingMessageState that does not have a tracking information", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(_ => Promise.resolve());
    const mockPendingMessageState = {
      id: "001",
      foreground: true
    } as PendingMessageState;
    trackMessageNotificationTapIfNeeded(mockPendingMessageState);
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
  it("should not call trackMessageNotificationTap when there is not a PendingMessageState", () => {
    const spiedTrackMessageNotificationTap = jest
      .spyOn(Analytics, "trackMessageNotificationTap")
      .mockImplementation(_ => Promise.resolve());
    trackMessageNotificationTapIfNeeded();
    expect(spiedTrackMessageNotificationTap).not.toHaveBeenCalled();
  });
});
