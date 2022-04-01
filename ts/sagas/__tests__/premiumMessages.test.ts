import { NavigationActions } from "react-navigation";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import {
  askPremiumMessagesOptIn,
  isPremiumMessagesEnabledSelector,
  setPremiumMessagesEnabled
} from "../premiumMessages";

describe("Premium messages sagas", () => {
  describe("askPremiumMessagesOptIn", () => {
    it("should handle the case in which the user already expressed a preference", () => {
      testSaga(askPremiumMessagesOptIn)
        .next()
        .select(isPremiumMessagesEnabledSelector)
        .next(true)
        .isDone()
        .back()
        .next(false)
        .isDone();
    });

    it("should handle the case in which the user has not expressed a preference", () => {
      testSaga(askPremiumMessagesOptIn)
        .next()
        .select(isPremiumMessagesEnabledSelector)
        .next(null)
        .call(
          NavigationService.dispatchNavigationAction,
          NavigationActions.navigate({
            routeName: ROUTES.ONBOARDING_PREMIUM_MESSAGES_OPT_IN_OUT
          })
        )
        .next()
        .take(setPremiumMessagesEnabled)
        .next()
        .isDone();
    });
  });
});
