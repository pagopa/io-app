import { testSaga } from "redux-saga-test-plan";

import { getType } from "typesafe-actions";

import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../store/actions/analytics";
import { loginSuccess } from "../../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { isSessionExpiredSelector } from "../../../store/reducers/authentication";

import { SessionToken } from "../../../types/SessionToken";

import { NavigationActions } from "react-navigation";
import { removeScheduledNotificationAccessSpid } from "../../../boot/scheduleLocalNotifications";
import ROUTES from "../../../navigation/routes";
import { authenticationSaga } from "../authenticationSaga";

const aSessionToken = "a_session_token" as SessionToken;

describe("authenticationSaga", () => {
  it("should navigate to authentication screen and return the session token on login success", () => {
    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted())
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .put(resetToAuthenticationRoute)
      .next()
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
      .select(isSessionExpiredSelector)
      .next(true)
      .put(
        NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION_IDP_SELECTION
        })
      )
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
