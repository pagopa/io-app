import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { watchSessionExpiredSaga } from "../watchSessionExpiredSaga";
import { restartCleanApplication } from "../../../../../sagas/commons";
import { sessionExpired } from "../../store/actions";

describe("watchSessionExpiredSaga", () => {
  it("should watch sessionExpired and call restartCleanApplication", () => {
    const gen = watchSessionExpiredSaga();
    expect(gen.next().value).toEqual(
      takeLatest(getType(sessionExpired), restartCleanApplication)
    );
    expect(gen.next().done).toBe(true);
  });
});
