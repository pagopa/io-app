import { testSaga } from "redux-saga-test-plan";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { getType } from "typesafe-actions";
import {
  logoutUserAfterActiveSessionLoginSaga,
  watchForceLogoutActiveSessionLogin
} from "../saga/forceLogoutActiveSessionLoginSaga";
import {
  setLoggedOutUserWithDifferentCF,
  logoutBeforeSessionCorrupted,
  setFinalizeLoggedOutUserWithDifferentCF
} from "../store/actions";
import { sessionCorrupted } from "../../common/store/actions";
import { sessionTokenSelector } from "../../common/store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { resetMixpanelSaga } from "../../../../sagas/mixpanel";
import { getKeyInfo } from "../../../lollipop/saga";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import * as error from "../../../../utils/errors";
import * as analytics from "../../common/analytics";
import * as messagesAnalytics from "../../../messages/analytics";

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

const setLoggedOutUserWithDifferentCFAction = setLoggedOutUserWithDifferentCF();
const logoutBeforeSessionCorruptedAction = logoutBeforeSessionCorrupted();

jest.mock("../../../../utils/supportAssistance", () => ({
  resetAssistanceData: jest.fn()
}));

// Mock logout function that will be extracted from backend client
const mockLogout = jest.fn();

jest.mock("../../../../api/BackendClientManager", () => ({
  backendClientManager: {
    getBackendClient: jest.fn(() => ({
      logout: mockLogout
    }))
  }
}));

jest.mock("../../../lollipop/saga", () => ({
  // eslint-disable-next-line object-shorthand, require-yield
  getKeyInfo: function* () {
    return defaultKeyInfo;
  },
  // eslint-disable-next-line object-shorthand, require-yield
  deleteCurrentLollipopKeyAndGenerateNewKeyTag: function* () {
    return;
  }
}));

jest.mock("../../common/analytics", () => ({
  trackLogoutSuccess: jest.fn(),
  trackLogoutFailure: jest.fn()
}));

jest.mock("../../../messages/analytics", () => ({
  trackUndefinedBearerToken: jest.fn(),
  UndefinedBearerTokenPhase: {
    activeSessionLoginLogout: "activeSessionLoginLogout"
  }
}));

describe("logoutUserAfterActiveSessionLoginSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockClear();
  });

  describe("when sessionToken is missing", () => {
    it("should return early without doing anything", () => {
      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        logoutBeforeSessionCorruptedAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(undefined) // No session token
        .next() // The saga returns here
        .isDone();

      // Verify that trackUndefinedBearerToken was called
      expect(messagesAnalytics.trackUndefinedBearerToken).toHaveBeenCalledWith(
        messagesAnalytics.UndefinedBearerTokenPhase.activeSessionLoginLogout
      );
    });
  });

  describe("when logout API call succeeds (status 200)", () => {
    it("should track success and finalize session corrupted flow", () => {
      const successResponse = E.right({ status: 200 });

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        logoutBeforeSessionCorruptedAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .next(successResponse) // Mock logout API success
        .put(sessionCorrupted())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .put(startApplicationInitialization())
        .next()
        .isDone();

      expect(analytics.trackLogoutSuccess).toHaveBeenCalledWith("reauth");
    });

    it("should track success and finalize different CF flow", () => {
      const successResponse = E.right({ status: 200 });

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        setLoggedOutUserWithDifferentCFAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .next(successResponse) // Mock logout API success
        .put(setFinalizeLoggedOutUserWithDifferentCF())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .isDone();

      expect(analytics.trackLogoutSuccess).toHaveBeenCalledWith("reauth");
    });
  });

  describe("when logout API call fails (status 500)", () => {
    it("should track failure with error title and finalize session corrupted flow", () => {
      const errorResponse = E.right({
        status: 500,
        value: { title: "Server Error" }
      });

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        logoutBeforeSessionCorruptedAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .next(errorResponse) // Mock logout API error
        .put(sessionCorrupted())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .put(startApplicationInitialization())
        .next()
        .isDone();

      expect(analytics.trackLogoutFailure).toHaveBeenCalledWith(
        new Error("Server Error"),
        "reauth"
      );
    });

    it("should track failure with generic error when no title and finalize different CF flow", () => {
      const errorResponse = E.right({
        status: 500,
        value: {}
      });

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        setLoggedOutUserWithDifferentCFAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .next(errorResponse) // Mock logout API error
        .put(setFinalizeLoggedOutUserWithDifferentCF())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .isDone();

      expect(analytics.trackLogoutFailure).toHaveBeenCalledWith(
        new Error("Unknown error"),
        "reauth"
      );
    });
  });

  describe("when logout API call returns validation error (E.left)", () => {
    it("should track failure with validation error and finalize flow", () => {
      const validationError = {
        context: [],
        value: "validation error",
        message: "Invalid request"
      };
      const leftResponse = E.left([validationError]);
      const expectedError = new Error(readableReport([validationError]));

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        logoutBeforeSessionCorruptedAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .next(leftResponse) // Mock validation error
        .put(sessionCorrupted())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .put(startApplicationInitialization())
        .next()
        .isDone();

      expect(analytics.trackLogoutFailure).toHaveBeenCalledWith(
        expectedError,
        "reauth"
      );
    });
  });

  describe("when logout API call throws an exception", () => {
    it("should track failure with converted error and finalize flow", () => {
      const thrownError = new Error("Network error");
      const convertedError = new Error("Converted network error");

      jest
        .spyOn(error, "convertUnknownToError")
        .mockReturnValue(convertedError);

      testSaga(
        logoutUserAfterActiveSessionLoginSaga,
        logoutBeforeSessionCorruptedAction
      )
        .next()
        .select(sessionTokenSelector)
        .next(sessionToken)
        .call(getKeyInfo)
        .next(defaultKeyInfo)
        .call(mockLogout, {})
        .throw(thrownError) // Mock exception during API call
        .put(sessionCorrupted())
        .next()
        .call(resetMixpanelSaga)
        .next()
        .put(startApplicationInitialization())
        .next()
        .isDone();

      expect(analytics.trackLogoutFailure).toHaveBeenCalledWith(
        convertedError,
        "reauth"
      );
    });
  });
});

describe("watchForceLogoutActiveSessionLogin", () => {
  it("should watch for setLoggedOutUserWithDifferentCF and logoutBeforeSessionCorrupted actions", () => {
    testSaga(watchForceLogoutActiveSessionLogin)
      .next()
      .takeLatest(
        [
          getType(setLoggedOutUserWithDifferentCF),
          getType(logoutBeforeSessionCorrupted)
        ],
        logoutUserAfterActiveSessionLoginSaga
      )
      .next()
      .isDone();
  });
});
