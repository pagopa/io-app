import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { fetchServicePreferencesForStartup } from "../handleGetServicePreference";
import { tryLoadSENDPreferences } from "../../../../pn/store/sagas/watchPnSaga";

describe("fetchServicePreferencesForStartup", () => {
  it("should call tryLoadSENDPreferences", () =>
    expectSaga(fetchServicePreferencesForStartup)
      .provide([[matchers.call.fn(tryLoadSENDPreferences), undefined]])
      .call(tryLoadSENDPreferences)
      .run());
});
