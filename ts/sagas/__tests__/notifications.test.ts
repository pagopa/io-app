import * as E from "fp-ts/lib/Either";
import { Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import {
  notificationsPlatform,
  updateInstallationSaga
} from "../notifications";

import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../store/actions/authentication";
import {
  notificationsInstallationTokenRegistered,
  updateNotificationsInstallationToken
} from "../../store/actions/notifications";

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
