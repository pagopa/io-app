import { testSaga } from "redux-saga-test-plan";

import { startApplicationInitialization } from "../../../../store/actions/application";
import { deletePin } from "../../../../utils/keychain";
import { sessionInvalid } from "../../../authentication/common/store/actions";
import { watchAbortOnboardingSaga } from "../../saga/watchAbortOnboardingSaga";
import { abortOnboarding } from "../../store/actions";

describe("watchAbortOnboardingSaga", () => {
  it("should wait for abortOnboarding action", () => {
    testSaga(watchAbortOnboardingSaga)
      .next()
      .take(abortOnboarding)
      .next()
      .call(deletePin)
      .next()
      .put(sessionInvalid())
      .next()
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });
});
