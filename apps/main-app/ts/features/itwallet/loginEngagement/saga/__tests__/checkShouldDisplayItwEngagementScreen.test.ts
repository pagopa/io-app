import { StackActions } from "@react-navigation/native";
import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";

import NavigationService from "../../../../../navigation/NavigationService";
import { hashedProfileFiscalCodeSelector } from "../../../../../store/reducers/crossSessions";
import { itwSetEngagementScreenShown } from "../../../common/store/actions/preferences";
import { ITW_ROUTES } from "../../../navigation/routes";
import { itwShouldShowEngagementScreenSelector } from "../../store/selectors";
import { checkShouldDisplayItwEngagementScreen } from "../checkShouldDisplayItwEngagementScreen";

describe("checkShouldDisplayItwEngagementScreen", () => {
  const navigationAction = StackActions.push(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ENGAGEMENT
  });

  it("skips on first onboarding", () =>
    expectSaga(checkShouldDisplayItwEngagementScreen, true)
      .not.call(NavigationService.dispatchNavigationAction, navigationAction)
      .returns(false)
      .run());

  it("does not show the screen when the user is not eligible", () =>
    expectSaga(checkShouldDisplayItwEngagementScreen, false)
      .provide([
        [select(hashedProfileFiscalCodeSelector), "user"],
        [select(itwShouldShowEngagementScreenSelector), false]
      ])
      .not.call(NavigationService.dispatchNavigationAction, navigationAction)
      .returns(false)
      .run());

  it("shows the screen and marks it as shown", () =>
    expectSaga(checkShouldDisplayItwEngagementScreen, false)
      .provide([
        [select(hashedProfileFiscalCodeSelector), "user"],
        [select(itwShouldShowEngagementScreenSelector), true],
        [
          call(NavigationService.dispatchNavigationAction, navigationAction),
          undefined
        ]
      ])
      .put(itwSetEngagementScreenShown("user"))
      .call(NavigationService.dispatchNavigationAction, navigationAction)
      .returns(true)
      .run());
});
