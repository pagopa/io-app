import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import OptInScreen from "../screens/OptInScreen";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

describe("OptInScreen", () => {
  it("the components into the page should be render correctly", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).toBeDefined();
    const acceptButton = component.getByTestId("accept-button-test");
    expect(acceptButton).toBeDefined();
    const declineButton = component.getByTestId("decline-button-test");
    expect(declineButton).toBeDefined();
    const suggestButton = component.getByText(
      I18n.t("authentication.opt_in.security_suggests")
    );
    expect(suggestButton).toBeDefined();

    if (acceptButton) {
      fireEvent.press(acceptButton);
    }
    if (declineButton) {
      fireEvent.press(declineButton);
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    OptInScreen,
    AUTHENTICATION_ROUTES.OPT_IN,
    {},
    store
  );
};
