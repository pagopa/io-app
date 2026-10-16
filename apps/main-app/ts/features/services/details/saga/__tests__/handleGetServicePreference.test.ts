import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { tryLoadSENDPreferences } from "../../../../pn/store/sagas/watchPnSaga";
import { fetchServicePreferencesForStartup } from "../handleGetServicePreference";

describe("fetchServicePreferencesForStartup", () => {
  it("should call tryLoadSENDPreferences", () =>
    expectSaga(fetchServicePreferencesForStartup)
      .provide([[matchers.call.fn(tryLoadSENDPreferences), undefined]])
      .call(tryLoadSENDPreferences)
      .run());
});
