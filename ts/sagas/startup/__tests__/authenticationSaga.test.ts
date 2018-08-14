import { testSaga } from "redux-saga-test-plan";

import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../store/actions/analytics";
import { loginSuccess } from "../../../store/actions/authentication";
import { LOGIN_SUCCESS } from "../../../store/actions/constants";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";

import { SessionToken } from "../../../types/SessionToken";

import { authenticationSaga } from "../authenticationSaga";

const aSessionToken = "a_session_token" as SessionToken;

describe("authenticationSaga", () => {
  it("should navigate to authentication screen and return the session token on login success", () => {
    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted)
      .next()
      .put(resetToAuthenticationRoute)
      .next()
      .take(LOGIN_SUCCESS)
      .next(loginSuccess(aSessionToken))
      .put(analyticsAuthenticationCompleted)
      .next()
      .returns(aSessionToken);
  });
});
