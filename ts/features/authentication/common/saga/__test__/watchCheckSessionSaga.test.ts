import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { testSaga } from "redux-saga-test-plan";
import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";
import {
  testableCheckSession,
  checkSessionResult
} from "../watchCheckSessionSaga";
import { handleSessionExpiredSaga } from "../../../fastLogin/saga/utils";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { sessionInfoSelector } from "../../store/selectors";
import {
  checkCurrentSession,
  sessionExpired,
  sessionInformationLoadSuccess
} from "../../store/actions";

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

    const fields = "(zendeskToken,walletToken,lollipopAssertionRef)";

    testSaga(testableCheckSession!, getSessionValidity, fields, false)
      .next()
      .call(getSessionValidity, { fields })
      .next(responseOK)
      .put(
        checkCurrentSession.success({
          isSessionValid: true
        })
      )
      .next()
      .select(sessionInfoSelector)
      .next()
      .put(sessionInformationLoadSuccess(responseValue as PublicSession))
      .next()
      .isDone();
  });

  it("if response is 401 the session is invalid", () => {
    const responseUnauthorized = E.right({ status: 401 });

    const fields = "(zendeskToken,walletToken,lollipopAssertionRef)";

    testSaga(testableCheckSession!, getSessionValidity, fields, false)
      .next()
      .call(getSessionValidity, { fields })
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

    const fields = undefined;

    testSaga(testableCheckSession!, getSessionValidity, fields, false)
      .next()
      .call(getSessionValidity, { fields })
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
    const responseLeft = E.left([validatorError]);

    const fields = "(zendeskToken,walletToken,lollipopAssertionRef)";

    testSaga(testableCheckSession!, getSessionValidity, fields, false)
      .next()
      .call(getSessionValidity, { fields })
      .next(responseLeft)
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
      (typeof checkCurrentSession)["success"]
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
