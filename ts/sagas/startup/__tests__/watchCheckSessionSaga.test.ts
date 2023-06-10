import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { testSaga } from "redux-saga-test-plan";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import {
  checkCurrentSession,
  sessionExpired,
  sessionInformationLoadSuccess
} from "../../../store/actions/authentication";
import {
  testableCheckSession,
  checkSessionResult
} from "../watchCheckSessionSaga";
import { handleSessionExpiredSaga } from "../../../features/fastLogin/saga/utils";
import { isFastLoginEnabledSelector } from "../../../features/fastLogin/store/selectors";

describe("checkSession", () => {
  const getSessionValidity = jest.fn();

  it("if response is 200 the session is valid", () => {
    const responseValue = {
      spidLevel: "https://www.spid.gov.it/SpidL2",
      walletToken: "ZXCVBNM098876543"
    };
    const responseOK = E.right({
      status: 200,
      value: responseValue
    });
    testSaga(testableCheckSession!, getSessionValidity)
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
    const responseUnauthorized = E.right({ status: 401 });
    testSaga(testableCheckSession!, getSessionValidity)
      .next()
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
    const response500 = E.right({ status: 500 });
    testSaga(testableCheckSession!, getSessionValidity)
      .next()
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
    const validatorError = {
      value: "some error occurred",
      context: [{ key: "", type: t.string }]
    };
    const responeLeft = E.left([validatorError]);
    testSaga(testableCheckSession!, getSessionValidity)
      .next()
      .call(getSessionValidity, {})
      .next(responeLeft)
      .put(
        checkCurrentSession.failure(
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
      .call(handleSessionExpiredSaga);
    testSaga(handleSessionExpiredSaga)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .put(sessionExpired());
  });
});
