import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import I18n from "../../../../../i18n";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import OptInScreen from "../screens/OptInScreen";

describe("OptInScreen", () => {
  it("the components into the page should be render correctly", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).toBeDefined();
    const acceptButton = component.getByTestId("accept-button-test");
    expect(acceptButton).toBeDefined();
    const declineButton = component.getByTestId("decline-button-test");
    expect(declineButton).toBeDefined();
    expect(component.getByTestId("badge-test")).toBeDefined();
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
    ROUTES.AUTHENTICATION_OPT_IN,
    {},
    store
  );
};
