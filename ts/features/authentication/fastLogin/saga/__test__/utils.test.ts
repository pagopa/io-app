import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import {
  withRefreshApiCall,
  handleSessionExpiredSaga,
  ThirdPartyTokenError,
  withThirdPartyRefreshApiCall
} from "../utils";
import {
  refreshSessionToken,
  savePendingAction
} from "../../store/actions/tokenRefreshActions";
import {
  //   checkCurrentSession,
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

// const checkSessionValid = checkCurrentSession.success({ isSessionValid: true });
// const checkSessionInvalid = checkCurrentSession.success({
//   isSessionValid: false
// });

jest.mock("typed-redux-saga/macro", () => require("redux-saga/effects"));

describe("utils saga", () => {
  describe("withRefreshApiCall", () => {
    it("should return response when status !== 401", () => {
      const gen = withRefreshApiCall(fakeApiCall(), fakeAction);
      gen.next();
      const result = gen.next(successResponse).value;
      expect(result).toEqual(successResponse);
    });

    it("should handle 401 and call handleSessionExpiredSaga", () => {
      const gen = withRefreshApiCall(fakeApiCall401(), fakeAction);
      gen.next();
      expect(gen.next(unauthorizedResponse).value).toEqual(
        put(savePendingAction({ pendingAction: fakeAction }))
      );
      expect(gen.next().value).toEqual(call(handleSessionExpiredSaga));
    });

    it("should throw error when no action and no skipThrowingError is false", () => {
      const gen = withRefreshApiCall(fakeApiCall401(), {
        errorMessage: "Session expired"
      });
      gen.next();
      gen.next(unauthorizedResponse);
      expect(() => gen.next()).toThrow("Session expired");
    });
  });

  describe("handleSessionExpiredSaga", () => {
    it("should dispatch refreshSessionToken if fast login is enabled", () => {
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
  });

  describe("ThirdPartyTokenError", () => {
    it("should create error with correct name and message", () => {
      const err = new ThirdPartyTokenError("my message");
      expect(err.name).toBe("ThirdPartyTokenError");
      expect(err.message).toBe("my message");
      expect(err.type).toBe("SESSION_IS_STILL_VALID");
    });
  });
});

describe("utils saga - additional coverage", () => {
  describe("withRefreshApiCall", () => {
    it("should handle 401 with no action and skipThrowingError true", () => {
      const gen = withRefreshApiCall(fakeApiCall401(), {
        errorMessage: "Session expired",
        skipThrowingError: true
      });
      gen.next();
      gen.next(unauthorizedResponse);
      const result = gen.next();
      expect(result.value).toEqual(unauthorizedResponse);
    });
  });

  describe("withThirdPartyRefreshApiCall", () => {
    it("should return response if status !== 401", () => {
      const gen = withThirdPartyRefreshApiCall(fakeApiCall());
      gen.next();
      const result = gen.next(successResponse);
      expect(result.value).toEqual(successResponse);
    });
  });
});
