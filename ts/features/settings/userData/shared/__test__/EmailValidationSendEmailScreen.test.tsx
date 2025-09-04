import { PreloadedState, createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import EmailValidationSendEmailScreen from "../screens/EmailValidationSendEmailScreen";

jest.mock("react-native-background-timer", () => ({
  runBackgroundTimer: jest.fn(),
  stopBackgroundTimer: jest.fn()
}));

const renderComponent = (customState?: Partial<GlobalState>) => {
  const baseState = appReducer(
    undefined,
    applicationChangeState("active")
  ) as unknown as PreloadedState<GlobalState>;
  const mergedState = {
    ...baseState,
    ...customState
  };

  const store = createStore(
    appReducer,
    mergedState as PreloadedState<GlobalState>
  );

  return {
    screen: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <EmailValidationSendEmailScreen />,
      SETTINGS_ROUTES.EMAIL_VERIFICATION_SCREEN,
      {
        isOnboarding: false,
        isFciEditEmailFlow: false,
        isEditingPreviouslyInsertedEmailMode: false
      },
      store
    )
  };
};

describe("EmailValidationSendEmailScreen", () => {
  it("should render title and subtitle when email is not validated", () => {
    const { screen } = renderComponent();
    expect(screen.getByTestId("title-test")).toHaveTextContent(
      I18n.t("email.newvalidate.title")
    );
    expect(screen.getByTestId("subtitle-test")).toBeDefined();
  });

  it("should navigate back to insert email screen when link is pressed", () => {
    const { screen } = renderComponent();
    const link = screen.getByTestId("link-test");
    fireEvent.press(link);
    expect(link).toBeTruthy();
  });
});
