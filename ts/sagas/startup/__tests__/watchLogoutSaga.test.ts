import { testSaga } from "redux-saga-test-plan";
import {
  logoutFailure,
  logoutRequest,
  logoutSuccess
} from "../../../features/authentication/common/store/actions";
import { watchLogoutSaga, logoutSaga } from "../watchLogoutSaga";

const logout = jest.fn();

const takeCancellableAction = [logoutRequest, logoutSuccess, logoutFailure];

const logoutRequestAct = logoutRequest({ withApiCall: true });
const logoutSuccessAct = logoutSuccess();
const logoutFailureAct = logoutFailure({
  error: new Error()
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
