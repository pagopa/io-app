import { testSaga } from "redux-saga-test-plan";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { getType } from "typesafe-actions";
import {
  logoutFailure,
  logoutRequest,
  logoutSuccess
} from "../../store/actions";
import { watchLogoutSaga, logoutSaga } from "../watchLogoutSaga";
import { resetMixpanelSaga } from "../../../../../sagas/mixpanel";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { startApplicationInitialization } from "../../../../../store/actions/application";
import * as error from "../../../../../utils/errors";
import { bareSessionTokenSelector } from "../../store/selectors";
import { SessionToken } from "../../../../../types/SessionToken";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import { getKeyInfo } from "../../../../lollipop/saga";

const sessionToken: SessionToken = "FAKE_SESSION_TOKEN" as SessionToken;
const defaultKeyInfo: KeyInfo = {
  keyTag: "FAKE_KEY_TAG",
  publicKey: {
    crv: "P_256",
    kty: "EC",
    x: "nDbpq45jXUKfWxodyvec3F1e+r0oTSqhakbauVmB59Y=",
    y: "CtI6Cozk4O5OJ4Q6WyjiUw9/K6TyU0aDdssd25YHZxg="
  },
  publicKeyThumbprint: "FAKE_THUMBPRINT"
};

const logoutRequestAct = logoutRequest({ withApiCall: true });
const logoutSuccessAct = logoutSuccess();
const logoutFailureAct = logoutFailure({
  error: new Error()
});

jest.mock("../../../../../utils/supportAssistance", () => ({
  resetAssistanceData: jest.fn()
}));

jest.mock("../../../../lollipop/saga", () => ({
  // eslint-disable-next-line object-shorthand, require-yield
  deleteCurrentLollipopKeyAndGenerateNewKeyTag: function* () {
    return;
  },
  // eslint-disable-next-line object-shorthand, require-yield
  getKeyInfo: function* () {
    return;
  }
}));

describe("logoutSaga", () => {
  const baseAction = logoutRequest({ withApiCall: true });

  it("handles successful logout (status 200)", () => {
    testSaga(logoutSaga, baseAction)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .next(E.right({ status: 200 })) // Logout success
      .put(logoutSuccess())
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("handles logout with 500 and title", () => {
    testSaga(logoutSaga, baseAction)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .next(E.right({ status: 500, value: { title: "Error title" } }))
      .put(logoutFailure({ error: new Error("Error title") }))
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("handles logout with 500 without title", () => {
    testSaga(logoutSaga, baseAction)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .next(E.right({ status: 500, value: {} }))
      .put(logoutFailure({ error: new Error("Unknown error") }))
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("handles logout with left", () => {
    const validationError = {
      context: [],
      value: "error",
      message: "Invalid"
    };

    const leftResponse = E.left([validationError]);
    const expectedError = new Error(readableReport([validationError]));

    testSaga(logoutSaga, baseAction)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .next(leftResponse)
      .put(logoutFailure({ error: expectedError }))
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("handles logout with exception", () => {
    const thrownError = new Error("Unexpected error");
    jest.spyOn(error, "convertUnknownToError").mockReturnValue(thrownError);

    testSaga(logoutSaga, baseAction)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .throw(thrownError)
      .put(logoutFailure({ error: thrownError }))
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("handles logout withApiCall: false", () => {
    const action = logoutRequest({ withApiCall: false });

    testSaga(logoutSaga, action)
      .next()
      .select(bareSessionTokenSelector)
      .next(sessionToken)
      .call(getKeyInfo)
      .next(defaultKeyInfo)
      .put(logoutSuccess())
      .next()
      .call(resetMixpanelSaga)
      .next()
      .put(startupLoadSuccess(StartupStatusEnum.NOT_AUTHENTICATED))
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });
});

describe("watchLogoutSaga", () => {
  it("should execute the normal logout flow cancelling the saga", () => {
    testSaga(watchLogoutSaga)
      .next()
      .takeLatest(getType(logoutRequest), logoutSaga)
      .next(logoutSuccessAct)
      .isDone();
  });

  it("should execute a failed logout flow cancelling the saga", () => {
    testSaga(watchLogoutSaga)
      .next()
      .takeLatest(getType(logoutRequest), logoutSaga)
      .next(logoutRequestAct)
      .next(logoutFailureAct)
      .isDone();
  });
});
