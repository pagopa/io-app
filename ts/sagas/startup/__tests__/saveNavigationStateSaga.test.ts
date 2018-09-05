import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { saveNavigationStateSaga } from "../saveNavigationStateSaga";

import { NAVIGATE_IF_LOGGED_IN } from "../../../store/actions/constants";
import { navigateIfLoggedIn } from "../../../store/actions/deferred-navigation";
import { navigationStateSelector } from "../../../store/reducers/navigation";

import { NavigationActions } from "react-navigation";
import ROUTES from "../../../navigation/routes";

describe("saveNavigationStateSaga", () => {
  it("should not set a deferred navigation action when not in main navigator", () => {
    return expectSaga(saveNavigationStateSaga)
      .provide([
        [
          matchers.select(navigationStateSelector),
          {
            index: 0,
            routes: [{}]
          }
        ]
      ])
      .not.put.like({ action: { type: NAVIGATE_IF_LOGGED_IN } })
      .run();
  });
  it("should set a deferred navigation action when in main navigator", () => {
    const subRoute = {
      routeName: "Test",
      params: { myparam: true },
      key: "test"
    };
    return expectSaga(saveNavigationStateSaga)
      .provide([
        [
          matchers.select(navigationStateSelector),
          {
            index: 0,
            routes: [
              {
                routeName: ROUTES.MAIN,
                index: 0,
                routes: [subRoute]
              }
            ]
          }
        ]
      ])
      .put(navigateIfLoggedIn(NavigationActions.navigate(subRoute)))
      .run();
  });
});
