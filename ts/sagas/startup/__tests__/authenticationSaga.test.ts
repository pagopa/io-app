import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { removeScheduledNotificationAccessSpid } from "../../../boot/scheduleLocalNotifications";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../store/actions/analytics";
import { loginSuccess } from "../../../store/actions/authentication";
import {
  navigateToIdpSelectionScreenAction,
  resetToAuthenticationRoute
} from "../../../store/actions/navigation";
import { isSessionExpiredSelector } from "../../../store/reducers/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { authenticationSaga } from "../authenticationSaga";

const aSessionToken = "a_session_token" as SessionToken;

describe("authenticationSaga", () => {
  it("should navigate to authentication screen and return the session token on login success", () => {
    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted())
      .next()
      .put(resetToAuthenticationRoute)
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .take(getType(loginSuccess))
      .next(loginSuccess(aSessionToken))
      .call(removeScheduledNotificationAccessSpid)
      .next()
      .put(analyticsAuthenticationCompleted())
      .next()
      .returns(aSessionToken);
  });

  it("should navigate to IDP selection screen on session expired and return the session token on login success", () => {
    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted())
      .next()
      .put(resetToAuthenticationRoute)
      .next()
      .select(isSessionExpiredSelector)
      .next(true)
      .put(navigateToIdpSelectionScreenAction)
      .next()
      .take(getType(loginSuccess))
      .next(loginSuccess(aSessionToken))
      .call(removeScheduledNotificationAccessSpid)
      .next()
      .put(analyticsAuthenticationCompleted())
      .next()
      .returns(aSessionToken);
  });
});
