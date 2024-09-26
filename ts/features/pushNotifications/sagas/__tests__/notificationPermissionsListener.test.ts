import { testSaga } from "redux-saga-test-plan";
import { notificationPermissionsListener } from "../notificationPermissionsListener";
import { checkAndUpdateNotificationPermissionsIfNeeded } from "../common";
import { applicationChangeState } from "../../../../store/actions/application";

describe("notificationPermissionsListener", () => {
  it("Should get and update system permissions, listen for application going into foreground, get and update the system permissions and then start to listen for application going into foreground again", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState)
      .next(applicationChangeState("active"))
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState);
  });
  it("Should get and update system permissions, listen for application state change, but not do anything if the state is 'background', starting to listening for application state change again", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState)
      .next(applicationChangeState("background"))
      .take(applicationChangeState);
  });
  it("Should get and update system permissions, listen for application state change, but not do anything if the state is 'extension', starting to listening for application state change again", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState)
      .next(applicationChangeState("extension"))
      .take(applicationChangeState);
  });
  it("Should get and update system permissions, listen for application state change, but not do anything if the state is 'inactive', starting to listening for application state change again", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState)
      .next(applicationChangeState("inactive"))
      .take(applicationChangeState);
  });
  it("Should get and update system permissions, listen for application state change, but not do anything if the state is 'unknown', starting to listening for application state change again", () => {
    testSaga(notificationPermissionsListener)
      .next()
      .call(checkAndUpdateNotificationPermissionsIfNeeded)
      .next()
      .take(applicationChangeState)
      .next(applicationChangeState("unknown"))
      .take(applicationChangeState);
  });
});
