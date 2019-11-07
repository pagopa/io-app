import { expectSaga } from "redux-saga-test-plan";
import { forceUpdateSaga } from "../forceUpdate";

import { NavigationActions } from "react-navigation";
import ROUTES from "../../../navigation/routes";

describe("forceUpdateSaga", () => {
  const minAppVersion = 3.2;
  const appVersion = 2.5;

  describe("when serverInfo has loaded minAppVersion", () => {
    it("should navigate to alert force update page", () => {
      // tslint:disable-next-line: no-floating-promises
      expectSaga(forceUpdateSaga, minAppVersion, appVersion)
        .put(
          NavigationActions.navigate({
            routeName: ROUTES.FORCE_UPDATE_APP
          })
        )
        .run();
    });
  });
});
