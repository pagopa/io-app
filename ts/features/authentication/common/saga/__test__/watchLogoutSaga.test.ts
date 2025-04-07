import { testSaga } from "redux-saga-test-plan";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
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

// ✅ MOCK del logout reale
const logout = jest.fn();

const takeCancellableAction = [logoutRequest, logoutSuccess, logoutFailure];

const logoutRequestAct = logoutRequest({ withApiCall: true });
const logoutSuccessAct = logoutSuccess();
const logoutFailureAct = logoutFailure({
  error: new Error()
});

// ✅ MOCK di supportAssistance
jest.mock("../../../../../utils/supportAssistance", () => ({
  resetAssistanceData: jest.fn()
}));

// ✅ MOCK di deleteCurrentLollipopKeyAndGenerateNewKeyTag
jest.mock("../../../../lollipop/saga", () => ({
  // eslint-disable-next-line object-shorthand, require-yield
  deleteCurrentLollipopKeyAndGenerateNewKeyTag: function* () {
    return;
  }
}));

describe("logoutSaga", () => {
  const mockLogoutFn = jest.fn();
  const baseAction = logoutRequest({ withApiCall: true });

  it("handles successful logout (status 200)", () => {
    testSaga(logoutSaga, mockLogoutFn, baseAction)
      .next()
      .call(mockLogoutFn, {})
      .next(E.right({ status: 200 }))
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
    testSaga(logoutSaga, mockLogoutFn, baseAction)
      .next()
      .call(mockLogoutFn, {})
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
    testSaga(logoutSaga, mockLogoutFn, baseAction)
      .next()
      .call(mockLogoutFn, {})
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

    testSaga(logoutSaga, mockLogoutFn, baseAction)
      .next()
      .call(mockLogoutFn, {})
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

    testSaga(logoutSaga, mockLogoutFn, baseAction)
      .next()
      .call(mockLogoutFn, {})
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

    testSaga(logoutSaga, mockLogoutFn, action)
      .next()
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
    testSaga(watchLogoutSaga, logout)
      .next()
      .take(takeCancellableAction)
      .next(logoutRequestAct)
      .fork(logoutSaga, logout, logoutRequestAct)
      .next()
      .take(takeCancellableAction)
      .next(logoutSuccessAct)
      .isDone();
  });

  it("should execute a failed logout flow cancelling the saga", () => {
    testSaga(watchLogoutSaga, logout)
      .next()
      .take(takeCancellableAction)
      .next(logoutRequestAct)
      .fork(logoutSaga, logout, logoutRequestAct)
      .next()
      .take(takeCancellableAction)
      .next(logoutFailureAct)
      .isDone();
  });
});
