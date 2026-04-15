import { testSaga } from "redux-saga-test-plan";
import {
  checkNotificationPermissionsOnAppForegroundState,
  notificationPermissionsListener
} from "../notificationPermissionsListener";
import { checkAndUpdateNotificationPermissionsIfNeeded } from "../common";
import { applicationChangeState } from "../../../../store/actions/application";

describe("notificationPermissionsListener", () => {
  it("Should get and update system permissions and start listening for 'applicationChangeState' action with 'takeLatest'", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded, true)
      .next()
      .takeLatest(
        applicationChangeState,
        checkNotificationPermissionsOnAppForegroundState
      )
      .next()
      .isDone();
  });
});

describe("checkNotificationPermissionsOnAppForegroundState", () => {
  it("Should call 'checkAndUpdateNotificationPermissionsIfNeeded' and terminate if new app state is 'active'", () => {
    testSaga(
      checkNotificationPermissionsOnAppForegroundState,
      applicationChangeState("active")
    )
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .isDone();
  });
  it("Should do nothing and terminate if new app state is 'background'", () => {
    testSaga(
      checkNotificationPermissionsOnAppForegroundState,
      applicationChangeState("background")
    )
      .next()
      .isDone();
  });
  it("Should do nothing and terminate if new app state is 'extension'", () => {
    testSaga(
      checkNotificationPermissionsOnAppForegroundState,
      applicationChangeState("extension")
    )
      .next()
      .isDone();
  });
  it("Should do nothing and terminate if new app state is 'inactive'", () => {
    testSaga(
      checkNotificationPermissionsOnAppForegroundState,
      applicationChangeState("inactive")
    )
      .next()
      .isDone();
  });
  it("Should do nothing and terminate if new app state is 'unknown'", () => {
    testSaga(
      checkNotificationPermissionsOnAppForegroundState,
      applicationChangeState("unknown")
    )
      .next()
      .isDone();
  });
});
