import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { restartCleanApplication } from "../../../../../sagas/commons";
import { sessionCorrupted, sessionExpired } from "../../store/actions";
import { watchForceLogoutSaga } from "../watchForceLogoutSaga";
import { setLggedOutUserWithDifferentCF } from "../../../activeSessionLogin/store/actions";

describe("watchForceLogoutSaga", () => {
  it("should watch sessionExpired and call restartCleanApplication", () => {
    const gen = watchForceLogoutSaga();
    expect(gen.next().value).toEqual(
      takeLatest(
        [
          getType(sessionExpired),
          getType(sessionCorrupted),
          getType(setLggedOutUserWithDifferentCF)
        ],
        restartCleanApplication
      )
    );
    expect(gen.next().done).toBe(true);
  });
});
