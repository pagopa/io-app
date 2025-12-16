import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { restartCleanApplication } from "../../../../../sagas/commons";
import { sessionExpired } from "../../store/actions";
import { watchForceLogoutSaga } from "../watchForceLogoutSaga";

describe("watchForceLogoutSaga", () => {
  it("should watch sessionExpired and call restartCleanApplication", () => {
    const gen = watchForceLogoutSaga();
    expect(gen.next().value).toEqual(
      takeLatest(getType(sessionExpired), restartCleanApplication)
    );
    expect(gen.next().done).toBe(true);
  });
});
