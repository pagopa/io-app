import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import {
  logoutFailure,
  logoutRequest,
  logoutSuccess
} from "../../../store/actions/authentication";
import { watchLogoutSaga, logoutSaga } from "../watchLogoutSaga";

const logout = jest.fn();

const takeCancellableAction = [
  getType(logoutRequest),
  getType(logoutSuccess),
  getType(logoutFailure)
];

const logoutRequestAct = logoutRequest({ keepUserData: true });
const logoutSuccessAct = logoutSuccess({ keepUserData: true });
const logoutFailureAct = logoutFailure({
  error: new Error(),
  options: { keepUserData: true }
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
