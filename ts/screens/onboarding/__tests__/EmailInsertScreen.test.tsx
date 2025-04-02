import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import I18n from "../../../i18n";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import EmailInsertScreen from "../../../features/settings/userData/shared/views/EmailInsertScreen";

describe("EmailInsertScreen", () => {
  it("the components into the page should be render correctly", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).not.toBeNull();
    expect(component.getByTestId("title-test")).toBeDefined();
    expect(
      component.queryByText(I18n.t("global.buttons.continue"))
    ).toBeDefined();
  });
  it("the header button should be render correctly and the user can press it", () => {
    const component = renderComponent();
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );
    expect(continueButton).toBeTruthy();
    if (continueButton) {
      fireEvent.press(continueButton);
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    EmailInsertScreen,
    ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
    {},
    store
  );
};
