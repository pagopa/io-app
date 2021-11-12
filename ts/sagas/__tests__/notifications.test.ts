import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { right } from "fp-ts/lib/Either";
import { Action } from "redux";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import {
  notificationsPlatform,
  updateInstallationSaga
} from "../notifications";

import {
  notificationsInstallationTokenRegistered,
  updateNotificationsInstallationToken
} from "../../store/actions/notifications";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../store/actions/authentication";

const installationId = "installationId";
jest.mock("../../utils/installation", () => ({
  generateInstallationId: () => installationId
}));

describe("updateInstallationSaga", () => {
  it("should do nothing - push notification token is not stored yet", () => {
    const globalState = updateState([applicationChangeState("active")]);
    const createOrUpdateInstallation = jest.fn();
    void expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .returns(undefined)
      .run();
  });

  it("should send the push notification token - push notification token is stored and no previous token are been sent", () => {
    const pushNotificationToken = "googleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken)
    ]);
    const createOrUpdateInstallation = jest.fn();
    return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .provide([
        [matchers.call.fn(createOrUpdateInstallation), right({ status: 200 })]
      ])
      .call(createOrUpdateInstallation, {
        installationID: installationId,
        installation: {
          platform: notificationsPlatform,
          pushChannel: pushNotificationToken
        }
      })
      .put(notificationsInstallationTokenRegistered(pushNotificationToken))
      .run();
  });

  it("should not send the push notification token - push notification token has been already sent and it doesn't change", () => {
    const pushNotificationToken = "googleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken),
      notificationsInstallationTokenRegistered(pushNotificationToken)
    ]);
    const createOrUpdateInstallation = jest.fn();
    return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .returns(undefined)
      .run();
  });

  it("should send the push notification token - push notification token has been already sent but it is changed", () => {
    const newPushNotificationToken = "newGoogleOrApplePushNotificationToken";
    const oldPushNotificationToken = "oldGoogleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(oldPushNotificationToken),
      notificationsInstallationTokenRegistered(oldPushNotificationToken),
      updateNotificationsInstallationToken(newPushNotificationToken)
    ]);
    const createOrUpdateInstallation = jest.fn();
    return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .provide([
        [matchers.call.fn(createOrUpdateInstallation), right({ status: 200 })]
      ])
      .call(createOrUpdateInstallation, {
        installationID: installationId,
        installation: {
          platform: notificationsPlatform,
          pushChannel: newPushNotificationToken
        }
      })
      .put(notificationsInstallationTokenRegistered(newPushNotificationToken))
      .run();
  });

  it("should send the push notification token - push notification token has been sent but the user do logout", () => {
    const pushNotificationToken = "newGoogleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken),
      notificationsInstallationTokenRegistered(pushNotificationToken),
      logoutRequest({ keepUserData: false })
    ]);
    const createOrUpdateInstallation = jest.fn();
    return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .provide([
        [matchers.call.fn(createOrUpdateInstallation), right({ status: 200 })]
      ])
      .call(createOrUpdateInstallation, {
        installationID: installationId,
        installation: {
          platform: notificationsPlatform,
          pushChannel: pushNotificationToken
        }
      })
      .put(notificationsInstallationTokenRegistered(pushNotificationToken))
      .run();
  });

  it("should send the push notification token - push notification token has been sent but the session is expired", () => {
    const pushNotificationToken = "newGoogleOrApplePushNotificationToken";
    const globalState = updateState([
      applicationChangeState("active"),
      updateNotificationsInstallationToken(pushNotificationToken),
      notificationsInstallationTokenRegistered(pushNotificationToken),
      sessionExpired()
    ]);
    const createOrUpdateInstallation = jest.fn();
    return expectSaga(updateInstallationSaga, createOrUpdateInstallation)
      .withState(globalState)
      .provide([
        [matchers.call.fn(createOrUpdateInstallation), right({ status: 200 })]
      ])
      .call(createOrUpdateInstallation, {
        installationID: installationId,
        installation: {
          platform: notificationsPlatform,
          pushChannel: pushNotificationToken
        }
      })
      .put(notificationsInstallationTokenRegistered(pushNotificationToken))
      .run();
  });

  it("should send the push notification token - push notification token has been sent but the session is invalid", () => {
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
        [matchers.call.fn(createOrUpdateInstallation), right({ status: 200 })]
      ])
      .call(createOrUpdateInstallation, {
        installationID: installationId,
        installation: {
          platform: notificationsPlatform,
          pushChannel: pushNotificationToken
        }
      })
      .put(notificationsInstallationTokenRegistered(pushNotificationToken))
      .run();
  });
});

const updateState = (
  actions: ReadonlyArray<Action>,
  currentState: ReturnType<typeof appReducer> | undefined = undefined
) => actions.reduce((acc, curr) => appReducer(acc, curr), currentState);
