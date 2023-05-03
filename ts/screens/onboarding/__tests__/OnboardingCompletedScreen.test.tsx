import { testSaga } from "redux-saga-test-plan";
import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { CommonActions, StackActions } from "@react-navigation/native";
import { completeOnboardingSaga } from "../../../sagas/startup/completeOnboardingSaga";
import OnboardingCompletedScreen from "../OnboardingCompletedScreen";
import I18n from "../../../i18n";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ROUTES from "../../../navigation/routes";
import { completeOnboarding } from "../../../store/actions/onboarding";
import NavigationService from "../../../navigation/NavigationService";

describe("Given the OnboardingCompletedScreen", () => {
  describe("when the user taps on the continue button", () => {
    it("then the completeOnboarding action is dispatched", () => {
      const { screen, store } = renderComponent();
      const continueButton = screen.queryByText(
        I18n.t("global.buttons.continue")
      );
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
    screen: renderScreenFakeNavRedux<GlobalState>(
      OnboardingCompletedScreen,
      ROUTES.ONBOARDING_COMPLETED,
      {},
      store
    ),
    store
  };
};
