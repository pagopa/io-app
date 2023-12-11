import { createMockTask } from "@redux-saga/testing-utils";
import { Task } from "redux-saga";
import { testSaga } from "redux-saga-test-plan";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../store/actions/analytics";
import { loginSuccess } from "../../../store/actions/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { stopCieManager, watchCieAuthenticationSaga } from "../../cie";
import { watchTestLoginRequestSaga } from "../../testLoginSaga";
import { authenticationSaga } from "../authenticationSaga";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";

const aSessionToken = "a_session_token" as SessionToken;

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

describe("authenticationSaga", () => {
  it("should always navigate to authentication screen and return the session token on login success", () => {
    const watchCieAuthentication: Task = createMockTask();
    const watchTestLoginRequest: Task = createMockTask();

    testSaga(authenticationSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(analyticsAuthenticationStarted())
      .next()
      .fork(watchTestLoginRequestSaga)
      .next(watchTestLoginRequest)
      .fork(watchCieAuthenticationSaga)
      .next(watchCieAuthentication)
      .take(loginSuccess)
      .next(loginSuccess({ token: aSessionToken, idp: "test" }))
      .cancel(watchCieAuthentication)
      .next()
      .cancel(watchTestLoginRequest)
      .next()
      .call(stopCieManager)
      .next()
      .next(false) // fastloginSelector
      .next({ _tag: "some" }) // idpSelector
      .put(analyticsAuthenticationCompleted())
      .next()
      .returns(aSessionToken);
  });
});
