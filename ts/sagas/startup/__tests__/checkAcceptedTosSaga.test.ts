import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { TOS_ACCEPT_REQUEST } from "../../../store/actions/constants";
import { navigateToTosScreen } from "../../../store/actions/navigation";
import { tosAcceptSuccess } from "../../../store/actions/onboarding";
import { isTosAcceptedSelector } from "../../../store/reducers/onboarding";

import { checkAcceptedTosSaga } from "../checkAcceptedTosSaga";

describe("checkAcceptedTosSaga", () => {
  describe("when user has already accepted the ToS", () => {
    it("should do nothing", () => {
      return expectSaga(checkAcceptedTosSaga)
        .provide([[matchers.select(isTosAcceptedSelector), true]])
        .not.put(navigateToTosScreen)
        .run();
    });
  });

  describe("when user has not already accepted the ToS", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      testSaga(checkAcceptedTosSaga)
        .next()
        .select(isTosAcceptedSelector)
        .next(false)
        .put(navigateToTosScreen)
        .next()
        .take(TOS_ACCEPT_REQUEST)
        .next()
        .put(tosAcceptSuccess);
    });
  });
});
