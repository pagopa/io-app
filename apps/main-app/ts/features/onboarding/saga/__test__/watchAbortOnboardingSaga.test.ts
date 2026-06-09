import { testSaga } from "redux-saga-test-plan";
import { abortOnboarding } from "../../store/actions";
import { sessionInvalid } from "../../../authentication/common/store/actions";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { deletePin } from "../../../../utils/keychain";
import { watchAbortOnboardingSaga } from "../../saga/watchAbortOnboardingSaga";

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
