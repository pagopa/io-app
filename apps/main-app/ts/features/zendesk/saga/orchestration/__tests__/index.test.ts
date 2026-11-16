import type { NavigationState } from "@react-navigation/routers";

import { CommonActions } from "@react-navigation/native";
import { testSaga } from "redux-saga-test-plan";

import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { zendeskSupportStart } from "../../../store/actions";
import { zendeskSupport } from "../index";
import { zendeskSupportWorker } from "../zendeskSupportWorker";

const zendeskStart = zendeskSupportStart({
  assistanceType: {},
  startingRoute: "test"
});

const navigationState: NavigationState = {
  key: "root",
  index: 0,
  routeNames: [],
  routes: [],
  type: "stack",
  stale: false
};

const navigator = {
  current: {
    getRootState: () => navigationState
  }
};

describe("zendeskSupport", () => {
  it("restores the initial navigation state after the support flow completes", () => {
    testSaga(zendeskSupport, zendeskStart)
      .next()
      .call(NavigationService.getNavigator)
      .next(navigator)
      .call(zendeskSupportWorker, zendeskStart)
      .next("completed")
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.reset(navigationState)
      )
      .next()
      .returns("completed");
  });

  it("restores navigation and navigates to the generic failure screen on failure", () => {
    testSaga(zendeskSupport, zendeskStart)
      .next()
      .call(NavigationService.getNavigator)
      .next(navigator)
      .call(zendeskSupportWorker, zendeskStart)
      .next("failure")
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.reset(navigationState)
      )
      .next()
      .call(NavigationService.navigate, ROUTES.WORKUNIT_GENERIC_FAILURE)
      .next()
      .returns("failure");
  });

  it("navigates to the generic failure screen without resetting when navigation state is unavailable", () => {
    testSaga(zendeskSupport, zendeskStart)
      .next()
      .call(NavigationService.getNavigator)
      .next({ current: null })
      .call(zendeskSupportWorker, zendeskStart)
      .next("failure")
      .call(NavigationService.navigate, ROUTES.WORKUNIT_GENERIC_FAILURE)
      .next()
      .returns("failure");
  });
});
