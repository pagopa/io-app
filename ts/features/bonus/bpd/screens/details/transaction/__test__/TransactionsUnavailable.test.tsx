import { render } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import * as React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import I18n from "../../../../../../../i18n";
import TransactionsUnavailable from "../TransactionsUnavailable";

jest.mock("react-navigation", () => ({
  NavigationEvents: "mockNavigationEvents",
  StackActions: {
    push: jest
      .fn()
      .mockImplementation(x => ({ ...x, type: "Navigation/PUSH" })),
    replace: jest
      .fn()
      .mockImplementation(x => ({ ...x, type: "Navigation/REPLACE" })),
    reset: jest.fn()
  },
  NavigationActions: {
    navigate: jest.fn().mockImplementation(x => x)
  },
  createStackNavigator: jest.fn(),
  withNavigation: (component: any) => component
}));
describe("TransactionsUnavailable component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    jest.useFakeTimers();
    store = mockStore({
      search: { isSearchEnabled: false },
      persistedPreferences: { isPagoPATestEnabled: false },
      network: { isConnected: true },
      instabug: { unreadMessages: 0 }
    });
  });

  it("should show the payment-unavailable-icon.png", () => {
    const component = getComponent(store);
    const rasterImageComponent = component.queryByTestId("rasterImage");
    const paymentUnavailableIconPath =
      "../../../img/wallet/errors/payment-unavailable-icon.png";

    expect(rasterImageComponent).toHaveProp("source", {
      testUri: paymentUnavailableIconPath
    });
  });
  it("should use the right string as header, title and body", () => {
    const component = getComponent(store);
    const headerTitle = component.getByText(
      I18n.t("bonus.bpd.details.transaction.goToButton")
    );
    const title = component.getByText(
      I18n.t("bonus.bpd.details.transaction.error.title")
    );
    const body = component.getByText(
      I18n.t("bonus.bpd.details.transaction.error.body")
    );

    expect(headerTitle).not.toBeEmpty();
    expect(title).not.toBeEmpty();
    expect(body).not.toBeEmpty();
  });
});
const getComponent = (store: Store<unknown>) =>
  render(
    <Provider store={store}>
      <TransactionsUnavailable />
    </Provider>
  );
