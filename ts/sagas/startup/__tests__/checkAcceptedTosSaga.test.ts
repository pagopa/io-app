import { expectSaga, testSaga } from "redux-saga-test-plan";

import { getType } from "typesafe-actions";
import { tosVersion } from "../../../config";
import { navigateToTosScreen } from "../../../store/actions/navigation";
import { tosAccept } from "../../../store/actions/onboarding";
import { profileUpsert } from "../../../store/actions/profile";
import { checkAcceptedTosSaga } from "../checkAcceptedTosSaga";

describe("checkAcceptedTosSaga", () => {
  describe("when user has already accepted the last version of ToS", () => {
    it("should should do nothing", () => {
      return expectSaga(checkAcceptedTosSaga)
        .not.put(navigateToTosScreen)
        .run();
    });
  });

  describe("when user has not already accepted the ToS or accepted an old version", () => {
    it("should navigate to the terms of service screen and succeed when ToS get accepted", () => {
      testSaga(checkAcceptedTosSaga)
        .next()
        .put(navigateToTosScreen)
        .next()
        .take(getType(tosAccept))
        .next()
        .put(profileUpsert.request({ accepted_tos_version: tosVersion }));
    });
  });
});
