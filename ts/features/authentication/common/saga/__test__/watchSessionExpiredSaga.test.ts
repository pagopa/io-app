import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { restartCleanApplication } from "../../../../../sagas/commons";
import { sessionCorrupted, sessionExpired } from "../../store/actions";
import { watchSessionExpiredOrCorruptedSaga } from "../watchSessionExpiredSaga";

describe("watchSessionExpiredOrCorruptedSaga", () => {
  it("should watch sessionExpired and call restartCleanApplication", () => {
    const gen = watchSessionExpiredOrCorruptedSaga();
    expect(gen.next().value).toEqual(
      takeLatest(
        [getType(sessionExpired), getType(sessionCorrupted)],
        restartCleanApplication
      )
    );
    expect(gen.next().done).toBe(true);
  });
});
