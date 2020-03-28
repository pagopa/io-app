import { Task } from "redux-saga";
import { testSaga } from "redux-saga-test-plan";
import { createMockTask } from "redux-saga/utils";
import { getType } from "typesafe-actions";
import { removeScheduledNotificationAccessSpid } from "../../../boot/scheduleLocalNotifications";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../store/actions/analytics";
import { loginSuccess } from "../../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { SessionToken } from "../../../types/SessionToken";
import { stopCieManager, watchCieAuthenticationSaga } from "../../cie";
import { authenticationSaga } from "../authenticationSaga";

const aSessionToken = "a_session_token" as SessionToken;

jest.mock("react-native-background-timer", () => {
  return {
    startTimer: jest.fn()
  };
});

describe("authenticationSaga", () => {
  it("should always navigate to authentication screen and return the session token on login success", () => {
    const watchCieAuthentication: Task = createMockTask();

    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted())
      .next()
      .fork(watchCieAuthenticationSaga)
      .next(watchCieAuthentication)
      .put(resetToAuthenticationRoute)
      .next()
      .take(getType(loginSuccess))
      .next(loginSuccess(aSessionToken))
      .cancel(watchCieAuthentication)
      .next()
      .call(stopCieManager)
      .next()
      .call(removeScheduledNotificationAccessSpid)
      .next()
      .put(analyticsAuthenticationCompleted())
      .next()
      .returns(aSessionToken);
  });
});
