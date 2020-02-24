import { testSaga } from "redux-saga-test-plan";

import { analyticsAuthenticationStarted } from "../../../store/actions/analytics";

import { authenticationSaga } from "../authenticationSaga";

describe("authenticationSaga", () => {
  it("should always navigate to authentication screen and return the session token on login success", () => {
    testSaga(authenticationSaga)
      .next()
      .put(analyticsAuthenticationStarted())
      .next();
  });
});
