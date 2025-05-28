import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { never } from "io-ts";
import {
  withRefreshApiCall,
  handleSessionExpiredSaga,
  ThirdPartyTokenError,
  withThirdPartyRefreshApiCall,
  utilsExport
} from "../utils";
import {
  refreshSessionToken,
  savePendingAction
} from "../../store/actions/tokenRefreshActions";
import {
  checkCurrentSession,
  logoutRequest,
  sessionExpired
} from "../../../common/store/actions";
import { isFastLoginEnabledSelector } from "../../store/selectors";
import { Action } from "../../../../../store/actions/types";

const successResponse = E.right({ status: 200 });
const unauthorizedResponse = E.right({ status: 401 });

const fakeApiCall = () => Promise.resolve(successResponse);
const fakeApiCall401 = () => Promise.resolve(unauthorizedResponse);

const fakeAction: Action = logoutRequest({ withApiCall: false });

jest.mock("typed-redux-saga/macro", () => require("redux-saga/effects"));

describe("utils saga", () => {
  if (!utilsExport) {
    throw new Error("utilsExport is not available in test environment");
  }
  const utilsExportNotUndefined = utilsExport;

  it("withRefreshApiCall should return response when status !== 401", () => {
    const gen = withRefreshApiCall(fakeApiCall(), fakeAction);
    gen.next();
    const result = gen.next(successResponse).value;
    expect(result).toEqual(successResponse);
  });

  it("withRefreshApiCall should handle 401 and call handleSessionExpiredSaga", () => {
    const gen = withRefreshApiCall(fakeApiCall401(), fakeAction);
    gen.next();
    expect(gen.next(unauthorizedResponse).value).toEqual(
      put(savePendingAction({ pendingAction: fakeAction }))
    );
    expect(gen.next().value).toEqual(call(handleSessionExpiredSaga));
  });

  it("withRefreshApiCall should throw error when no action and no skipThrowingError is false", () => {
    const gen = withRefreshApiCall(fakeApiCall401(), {
      errorMessage: "Session expired"
    });
    gen.next();
    gen.next(unauthorizedResponse);
    expect(() => gen.next()).toThrow("Session expired");
  });

  it("handleSessionExpiredSaga should dispatch refreshSessionToken if fast login is enabled", () => {
    const gen = handleSessionExpiredSaga();
    expect(gen.next().value).toEqual(select(isFastLoginEnabledSelector));
    expect(gen.next(true).value).toEqual(
      put(
        refreshSessionToken.request({
          withUserInteraction: true,
          showIdentificationModalAtStartup: false,
          showLoader: true
        })
      )
    );
  });

  it("should dispatch sessionExpired if fast login is not enabled", () => {
    const gen = handleSessionExpiredSaga();
    expect(gen.next().value).toEqual(select(isFastLoginEnabledSelector));
    expect(gen.next(false).value).toEqual(put(sessionExpired()));
  });

  it("ThirdPartyTokenError should create error with correct name and message", () => {
    const err = new ThirdPartyTokenError("my message");
    expect(err.name).toBe("ThirdPartyTokenError");
    expect(err.message).toBe("my message");
    expect(err.type).toBe("SESSION_IS_STILL_VALID");
  });

  it("withRefreshApiCall should handle 401 with no action and skipThrowingError true", () => {
    const gen = withRefreshApiCall(fakeApiCall401(), {
      errorMessage: "Session expired",
      skipThrowingError: true
    });
    gen.next();
    gen.next(unauthorizedResponse);
    const result = gen.next();
    expect(result.value).toEqual(unauthorizedResponse);
  });

  it("withThirdPartyRefreshApiCall should return response if status !== 401", () => {
    const gen = withThirdPartyRefreshApiCall(fakeApiCall());
    gen.next();
    const result = gen.next(successResponse);
    expect(result.value).toEqual(successResponse);
  });

  it("should handle 401 + session valid → throws error", () => {
    const gen = withThirdPartyRefreshApiCall(fakeApiCall401(), {
      action: never as never,
      errorHandling: { errorMessage: "session valid" }
    });
    gen.next();
    gen.next(unauthorizedResponse);
    gen.next(); // checkCurrentSession.request
    expect(() =>
      gen.next(checkCurrentSession.success({ isSessionValid: true }))
    ).toThrow(ThirdPartyTokenError);
  });

  it("should handle 401 + session invalid + refresh started → return", () => {
    const gen = withThirdPartyRefreshApiCall(fakeApiCall401(), {
      action: never as never,
      errorHandling: { errorMessage: "ok", skipThrowingError: true }
    });
    gen.next();
    gen.next(unauthorizedResponse);
    gen.next();
    gen.next(checkCurrentSession.success({ isSessionValid: false }));
    gen.next({
      refreshAction: refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    });
    const result = gen.next();
    expect(result.value).toEqual(unauthorizedResponse);
  });

  it("isReduxAction should return true if object has a type", () => {
    expect(
      utilsExportNotUndefined.isReduxAction({
        type: "ACTION_TYPE"
      } as unknown as Action)
    ).toBe(true);
  });

  it("isReduxAction should return false if object has no type", () => {
    expect(utilsExportNotUndefined.isReduxAction({ errorMessage: "err" })).toBe(
      false
    );
  });

  it("waitForTheTokenRefreshToBeStarted should return refreshAction if received before timeout", () => {
    const gen =
      utilsExportNotUndefined.waitForTheTokenRefreshToBeStarted("error msg");
    gen.next(); // race
    const result = gen.next({ refreshAction: { type: "MOCK" } }).value;
    expect(result).toEqual({ type: "MOCK" });
  });

  it(" waitForTheTokenRefreshToBeStartedshould throw error if timeout wins", () => {
    const gen =
      utilsExportNotUndefined.waitForTheTokenRefreshToBeStarted(
        "timeout error"
      );
    gen.next();
    expect(() => gen.next({ timeout: true })).toThrow("timeout error");
  });

  it("isSessionInvalid should return true for invalid session", () => {
    const result = checkCurrentSession.success({ isSessionValid: false });
    expect(result.payload.isSessionValid).toBe(false);
  });
});
