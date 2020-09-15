import { left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { testSaga } from "redux-saga-test-plan";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import {
  checkCurrentSession,
  sessionExpired,
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../../store/actions/authentication";
import { loadSessionInformationSaga } from "../loadSessionInformationSaga";
import { checkSessionResult } from "../watchCheckSessionSaga";

describe("loadSessionInformationSaga", () => {
  const getSessionValidity = jest.fn();

  it("if response is 200 the session is valid", () => {
    const responseValue = {
      spidLevel: "https://www.spid.gov.it/SpidL2",
      walletToken: "ZXCVBNM098876543"
    };
    const responseOK = right({
      status: 200,
      value: responseValue
    });
    testSaga(loadSessionInformationSaga, getSessionValidity)
      .next()
      .call(getSessionValidity, {})
      .next(responseOK)
      .put(
        checkCurrentSession.success({
          isSessionValid: true
        })
      )
      .next()
      .put(sessionInformationLoadSuccess(responseValue as PublicSession))
      .next()
      .isDone();
  });

  it("if response is 401 the session is invalid", () => {
    const responseUnauthorized = right({ status: 401 });
    testSaga(loadSessionInformationSaga, getSessionValidity)
      .next()
      .call(getSessionValidity, {})
      .next(responseUnauthorized)
      .put(
        checkCurrentSession.success({
          isSessionValid: false
        })
      )
      .next()
      .put(sessionInformationLoadFailure(new Error("Invalid server response")))
      .next()
      .isDone();
  });

  it("if response is 500 the session is valid", () => {
    const response500 = right({ status: 500 });
    testSaga(loadSessionInformationSaga, getSessionValidity)
      .next()
      .call(getSessionValidity, {})
      .next(response500)
      .put(
        checkCurrentSession.success({
          isSessionValid: true
        })
      )
      .next()
      .put(sessionInformationLoadFailure(new Error("Invalid server response")))
      .next()
      .isDone();
  });

  it("if response is a left throws an error", () => {
    const validatorError = {
      value: "some error occurred",
      context: [{ key: "", type: t.string }]
    };
    const responeLeft = left([validatorError]);
    testSaga(loadSessionInformationSaga, getSessionValidity)
      .next()
      .call(getSessionValidity, {})
      .next(responeLeft)
      .put(
        sessionInformationLoadFailure(
          new Error(
            'value ["some error occurred"] at [root] is not a valid [string]'
          )
        )
      )
      .next()
      .isDone();
  });
});

describe("checkSessionResult", () => {
  it("if session is valid do nothing", () => {
    const sessionValidAction: ReturnType<typeof checkCurrentSession.success> = {
      type: "CHECK_CURRENT_SESSION_SUCCESS",
      payload: {
        isSessionValid: true
      }
    };
    testSaga(checkSessionResult, sessionValidAction).next().isDone();
  });
  it("if session is invalid call session expired", () => {
    const sessionInvalidAction: ReturnType<
      typeof checkCurrentSession["success"]
    > = {
      type: "CHECK_CURRENT_SESSION_SUCCESS",
      payload: {
        isSessionValid: false
      }
    };
    testSaga(checkSessionResult, sessionInvalidAction)
      .next()
      .put(sessionExpired());
  });
});
