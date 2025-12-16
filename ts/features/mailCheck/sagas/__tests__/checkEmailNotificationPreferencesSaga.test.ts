import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { isCustomEmailChannelEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { watchEmailNotificationPreferencesSaga } from "../checkEmailNotificationPreferencesSaga";

describe("watchEmailNotificationPreferencesSaga", () => {
  it("if the store has information about user preferences the saga should end", () => {
    testSaga(watchEmailNotificationPreferencesSaga)
      .next()
      .select(isCustomEmailChannelEnabledSelector)
      .next(pot.some("")) // have some information about user preferences
      .isDone();
  });

  it("if the store has not information about user preferences the saga checkEmailNotificationPreferencesSaga should be forked", () => {
    testSaga(watchEmailNotificationPreferencesSaga)
      .next()
      .select(isCustomEmailChannelEnabledSelector)
      .next(pot.none); // have no information about user preferences
  });
});
