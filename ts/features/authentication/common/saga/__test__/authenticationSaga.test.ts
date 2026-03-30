import { createMockTask } from "@redux-saga/testing-utils";
import { Task } from "redux-saga";
import { testSaga } from "redux-saga-test-plan";
import * as O from "fp-ts/Option";
import { authenticationSaga } from "../authenticationSaga";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../../../../store/actions/analytics";
import { watchTestLoginRequestSaga } from "../testLoginSaga";
import {
  stopCieManager,
  watchCieAuthenticationSaga
} from "../../../login/cie/sagas/cie";
import { loginSuccess } from "../../store/actions";
import * as storeSelectors from "../../store/selectors";
import * as selectors from "../../../fastLogin/store/selectors";
import {
  trackCieIDLoginSuccess,
  trackCieLoginSuccess,
  trackSpidLoginSuccess
} from "../../analytics";
import {
  IdpCIE,
  IdpCIE_ID
} from "../../../login/hooks/useNavigateToLoginMethod";

const aSessionToken = "mock-session-token";

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

jest.mock("../../analytics", () => ({
  trackCieLoginSuccess: jest.fn(),
  trackCieIDLoginSuccess: jest.fn(),
  trackSpidLoginSuccess: jest.fn(),
  trackLoginFlowStarting: jest.fn()
}));

describe("authenticationSaga", () => {
  it("should always navigate to authentication screen and return the session token on login success", () => {
    const watchCieAuthentication: Task = createMockTask();
    const watchTestLoginRequest: Task = createMockTask();

    testSaga(authenticationSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(analyticsAuthenticationStarted("auth"))
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
      .put(analyticsAuthenticationCompleted("auth"))
      .next()
      .returns(aSessionToken);
  });
});

describe("authenticationSaga 2", () => {
  const baseSteps = (idpMock: any, trackFn: jest.Mock) => {
    const watchCieAuthentication: Task = createMockTask();
    const watchTestLoginRequest: Task = createMockTask();

    jest.clearAllMocks();

    jest.spyOn(storeSelectors, "idpSelector").mockReturnValue(
      O.some({
        id: idpMock,
        name: "Fake IDP",
        logo: { light: { uri: "https://fake.logo" } },
        profileUrl: "https://fake.url"
      })
    );
    jest.spyOn(selectors, "isFastLoginEnabledSelector").mockReturnValue(false);

    testSaga(authenticationSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(analyticsAuthenticationStarted("auth"))
      .next()
      .fork(watchTestLoginRequestSaga)
      .next(watchTestLoginRequest)
      .fork(watchCieAuthenticationSaga)
      .next(watchCieAuthentication)
      .take(loginSuccess)
      .next(loginSuccess({ token: aSessionToken, idp: idpMock }))
      .cancel(watchCieAuthentication)
      .next()
      .cancel(watchTestLoginRequest)
      .next()
      .call(stopCieManager)
      .next()
      .select(selectors.isFastLoginEnabledSelector)
      .next(false)
      .select(storeSelectors.idpSelector)
      .next(
        O.some({
          id: idpMock,
          name: "Fake IDP",
          logo: "https://fake.logo",
          profileUrl: "https://fake.url"
        })
      )
      .next()
      .returns(aSessionToken);

    if (trackFn === trackSpidLoginSuccess) {
      expect(trackFn).toHaveBeenCalledWith("30", idpMock);
    } else {
      expect(trackFn).toHaveBeenCalledWith("30");
    }
  };

  it("tracks SPID login", () => {
    baseSteps("spid-idp", trackSpidLoginSuccess as jest.Mock);
  });

  it("tracks CIE login", () => {
    baseSteps(IdpCIE.id, trackCieLoginSuccess as jest.Mock);
  });

  it("tracks CIE ID login", () => {
    baseSteps(IdpCIE_ID.id, trackCieIDLoginSuccess as jest.Mock);
  });
});
