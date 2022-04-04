import { NavigationActions } from "react-navigation";
import { testSaga } from "redux-saga-test-plan";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { isPremiumMessagesOptInOutEnabledSelector } from "../../store/reducers/backendStatus";
import {
  askPremiumMessagesOptInOut,
  isPremiumMessagesAcceptedSelector,
  setPremiumMessagesEnabled
} from "../premiumMessages";

describe("Premium messages sagas", () => {
  describe("askPremiumMessagesOptInOut", () => {
    it("should handle the case in which the remote feature flag for the opt-in/out is disabled", () => {
      testSaga(askPremiumMessagesOptInOut)
        .next()
        .select(isPremiumMessagesOptInOutEnabledSelector)
        .next(false)
        .isDone();
    });

    it("should handle the case in which the user already expressed a preference", () => {
      testSaga(askPremiumMessagesOptInOut)
        .next()
        .select(isPremiumMessagesOptInOutEnabledSelector)
        .next(true)
        .select(isPremiumMessagesAcceptedSelector)
        .next(true)
        .isDone()
        .back()
        .next(false)
        .isDone();
    });

    it("should handle the case in which the user has not expressed a preference", () => {
      testSaga(askPremiumMessagesOptInOut)
        .next()
        .select(isPremiumMessagesOptInOutEnabledSelector)
        .next(true)
        .select(isPremiumMessagesAcceptedSelector)
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
