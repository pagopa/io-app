import { left, right } from "fp-ts/lib/Either";
import { ValidationError } from "io-ts";
import { testSaga } from "redux-saga-test-plan";
import {
  checkCurrentSession,
  sessionExpired
} from "../../../store/actions/authentication";
import { isSessionExpiredSelector } from "../../../store/reducers/authentication";
import { checkSession, checkSessionResult } from "../watchCheckSessionSaga";

describe("checkSession", () => {
  const getSessionValidity = jest.fn();

  it("if session is already expired or user is not logged in it does nothing", () => {
    testSaga(checkSession, getSessionValidity)
      .next()
      .select(isSessionExpiredSelector)
      .next(true)
      .isDone();
  });

  it("if response is 200 the session is valid", () => {
    const responseOK = right({ status: 200 });
    testSaga(checkSession, getSessionValidity)
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .call(getSessionValidity, {})
      .next(responseOK)
      .put(
        checkCurrentSession.success({
          isSessionValid: true
        })
      )
      .next()
      .isDone();
  });

  it("if response is 401 the session is invalid", () => {
    const responseUnauthorized = right({ status: 401 });
    testSaga(checkSession, getSessionValidity)
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .call(getSessionValidity, {})
      .next(responseUnauthorized)
      .put(
        checkCurrentSession.success({
          isSessionValid: false
        })
      )
      .next()
      .isDone();
  });

  it("if response is 500 the session is valid", () => {
    const response500 = right({ status: 500 });
    testSaga(checkSession, getSessionValidity)
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .call(getSessionValidity, {})
      .next(response500)
      .put(
        checkCurrentSession.success({
          isSessionValid: true
        })
      )
      .next()
      .isDone();
  });

  it("if response is a left throws an error", () => {
    const responeLeft = left([{ value: "Error" }]);
    testSaga(checkSession, getSessionValidity)
      .next()
      .select(isSessionExpiredSelector)
      .next(false)
      .call(getSessionValidity, {})
      .next(responeLeft)
      .put(checkCurrentSession.failure([{ value: "Error" } as ValidationError]))
      .next()
      .isDone();
  });
});

describe("checkSessionResult", () => {
  it("if session is valid do nothing", () => {
    const sessionValidAction = {
      type: checkCurrentSession.request,
      payload: {
        isSessionValid: true
      }
    };
    testSaga(checkSessionResult, sessionValidAction)
      .next()
      .isDone();
  });
  it("if session is invalid call session expired", () => {
    const sessionInvalidAction = {
      type: checkCurrentSession.request,
      payload: {
        isSessionValid: false
      }
    };
    testSaga(checkSessionResult, sessionInvalidAction)
      .next()
      .put(sessionExpired());
  });
});
