import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import {
  awaitForPushNotificationToken,
  notificationsPlatform,
  pushNotificationTokenUpload
} from "../pushNotificationTokenUpload";
import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../../store/actions/installation";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../../store/reducers/installation";
import {
  trackNotificationInstallationTokenNotChanged,
  trackPushNotificationTokenUploadFailure,
  trackPushNotificationTokenUploadSucceeded
} from "../../analytics";

describe("pushNotificationTokenUpload", () => {
  it("when the push token is available and not yet registered, it should invoke the backend API and, upon success, dispatch 'pushNotificationsTokenUploaded(token)' and call 'trackPushNotificationTokenUploadSucceeded'", () => {
    const backendAPI = jest.fn();
    const installation = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    testSaga(pushNotificationTokenUpload, backendAPI)
      .next()
      .call(awaitForPushNotificationToken)
      .next(installation)
      .call(backendAPI, {
        installationID: installation.id,
        body: {
          platform: notificationsPlatform,
          pushChannel: installation.token
        }
      })
      .next(
        E.right({
          status: 200
        })
      )
      .put(pushNotificationsTokenUploaded(installation.token))
      .next()
      .call(trackPushNotificationTokenUploadSucceeded)
      .next()
      .isDone();
  });
  it("when the push token is available and registered, it should call 'trackNotificationInstallationTokenNotChanged' and end", () => {
    const backendAPI = jest.fn();
    const installation = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad",
      registeredToken:
        "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    testSaga(pushNotificationTokenUpload, backendAPI)
      .next()
      .call(awaitForPushNotificationToken)
      .next(installation)
      .call(trackNotificationInstallationTokenNotChanged)
      .next()
      .isDone();
  });
  it("when the push token is available and not yet registered, it should invoke the backend API but, upon response decoding failure, it should call 'trackPushNotificationTokenUploadFailure' and end", () => {
    const backendAPI = jest.fn();
    const installation = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    testSaga(pushNotificationTokenUpload, backendAPI)
      .next()
      .call(awaitForPushNotificationToken)
      .next(installation)
      .call(backendAPI, {
        installationID: installation.id,
        body: {
          platform: "apns",
          pushChannel: installation.token
        }
      })
      .next(E.left({}))
      .call(
        trackPushNotificationTokenUploadFailure,
        "TypeError: es.map is not a function"
      )
      .next()
      .isDone();
  });
  it("when the push token is available and not yet registered, it should invoke the backend API but, upon HTTP response code different than 200, it should call 'trackPushNotificationTokenUploadFailure' and end", () => {
    const backendAPI = jest.fn();
    const installation = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    [
      100, 101, 102, 103, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301,
      302, 303, 304, 305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407,
      408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424,
      425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508,
      510, 511
    ].forEach(httpStatusCode =>
      testSaga(pushNotificationTokenUpload, backendAPI)
        .next()
        .call(awaitForPushNotificationToken)
        .next(installation)
        .call(backendAPI, {
          installationID: installation.id,
          body: {
            platform: "apns",
            pushChannel: installation.token
          }
        })
        .next(
          E.right({
            status: httpStatusCode
          })
        )
        .call(
          trackPushNotificationTokenUploadFailure,
          `response status code ${httpStatusCode}`
        )
        .next()
        .isDone()
    );
  });
  it("when the push token is available and not yet registered, it should invoke the backend API but, upon exception, it should call 'trackPushNotificationTokenUploadFailure' and end", () => {
    const backendAPI = jest.fn();
    const installation = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    const error = new Error("An unknown error occourred");
    testSaga(pushNotificationTokenUpload, backendAPI)
      .next()
      .call(awaitForPushNotificationToken)
      .next(installation)
      .call(backendAPI, {
        installationID: installation.id,
        body: {
          platform: "apns",
          pushChannel: installation.token
        }
      })
      .throw(error)
      .call(trackPushNotificationTokenUploadFailure, `${error}`)
      .next()
      .isDone();
  });
});

describe("awaitForPushNotificationToken", () => {
  it("should return the 'installation' instance when 'token' is defined", () => {
    const installation: InstallationState = {
      id: "001abe9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    testSaga(awaitForPushNotificationToken)
      .next()
      .select(notificationsInstallationSelector)
      .next(installation)
      .returns(installation)
      .next()
      .isDone();
  });
  it("should wait for 'newPushNotificationToken' dispatch when no 'token' is available and return the new installation", () => {
    const installationNoToken: InstallationState = {
      id: "001plh9de70768541f2ad76d62636797f4f"
    };
    const installationWithToken: InstallationState = {
      id: "001oki9de70768541f2ad76d62636797f4f",
      token: "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"
    };
    testSaga(awaitForPushNotificationToken)
      .next()
      .select(notificationsInstallationSelector)
      .next(installationNoToken)
      .take(newPushNotificationsToken)
      .next()
      .select(notificationsInstallationSelector)
      .next(installationWithToken)
      .returns(installationWithToken)
      .next()
      .isDone();
  });
  it("should wait for 'newPushNotificationToken' dispatch when no 'token' is available and wait for it again if, for some reason, the token is still not available", () => {
    const installationNoToken: InstallationState = {
      id: "001okj9de70768541f2ad76d62636797f4f"
    };
    testSaga(awaitForPushNotificationToken)
      .next()
      .select(notificationsInstallationSelector)
      .next(installationNoToken)
      .take(newPushNotificationsToken)
      .next()
      .select(notificationsInstallationSelector)
      .next(installationNoToken)
      .take(newPushNotificationsToken);
  });
});
