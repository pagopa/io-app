import { CommonActions, StackActions } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { testSaga } from "redux-saga-test-plan";

import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { completeOnboardingSaga } from "../../saga/completeOnboardingSaga";
import { completeOnboarding } from "../../store/actions";
import OnboardingCompletedScreen from "../OnboardingCompletedScreen";

describe("Given the OnboardingCompletedScreen", () => {
  describe("when the user taps on the continue button", () => {
    it("then the completeOnboarding action is dispatched", () => {
      const { screen, store } = renderComponent();
      const continueButton = screen.queryByText(I18n.t("global.buttons.close"));
      expect(continueButton).toBeTruthy();
      if (continueButton) {
        fireEvent.press(continueButton);
        expect(store.getActions()).toStrictEqual([completeOnboarding()]);
      }
    });
  });
});

describe("Given the completeOnboardingSaga", () => {
  describe("when the completeOnboarding action is dispatched", () => {
    it("then the saga is done", () => {
      testSaga(completeOnboardingSaga)
        .next()
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.navigate(ROUTES.ONBOARDING, {
            screen: ROUTES.ONBOARDING_COMPLETED
          })
        )
        .next()
        .take(completeOnboarding)
        .next()
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.popToTop()
        )
        .next()
        .isDone();
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    screen: renderScreenWithNavigationStoreContext<GlobalState>(
      OnboardingCompletedScreen,
      ROUTES.ONBOARDING_COMPLETED,
      {},
      store
    ),
    store
  };
};
