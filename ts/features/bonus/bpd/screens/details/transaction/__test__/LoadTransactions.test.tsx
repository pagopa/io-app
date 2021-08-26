import { render } from "@testing-library/react-native";
import * as React from "react";
import I18n from "../../../../../../../i18n";
import LoadTransactions from "../LoadTransactions";

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
describe("LoadTransactions component", () => {
  it("should show the activity indicator", () => {
    const component = render(<LoadTransactions />);
    const activityIndicator = component.queryByTestId("activityIndicator");

    expect(activityIndicator).not.toBe(null);
  });
  it("should show the right title", () => {
    const component = render(<LoadTransactions />);
    const title = component.getByText(
      I18n.t("bonus.bpd.details.transaction.loading")
    );

    expect(title).not.toBeEmpty();
  });
});
