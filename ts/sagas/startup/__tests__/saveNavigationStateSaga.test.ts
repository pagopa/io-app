import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { saveNavigationStateSaga } from "../saveNavigationStateSaga";

import { navigationStateSelector } from "../../../store/reducers/navigation";

import { NavigationActions } from "react-navigation";
import ROUTES from "../../../navigation/routes";
import { DEFER_TO_LOGIN } from "../../../store/actions/constants";
import { deferToLogin } from "../../../store/actions/deferred";

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
      .not.put.like({ action: { type: DEFER_TO_LOGIN } })
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
      .put(deferToLogin(NavigationActions.navigate(subRoute)))
      .run();
  });
});
