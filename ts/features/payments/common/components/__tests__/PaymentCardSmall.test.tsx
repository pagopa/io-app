import { default as React } from "react";
import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentCardSmall, PaymentCardSmallProps } from "../PaymentCardSmall";

describe("PaymentCardSmall component", () => {
  const testID = "PaymentCardSmallTestID";
  jest.useFakeTimers();
  it(`matches snapshot for loading`, () => {
    const component = renderCardSmall({ isLoading: true });
    expect(component).toMatchSnapshot();
  });
  it(`matches snapshot for paypal`, () => {
    const component = renderCardSmall({ cardType: "PAYPAL" });
    expect(component).toMatchSnapshot();
  });

  it(`should render the Pressable component when passed an OnPress`, () => {
    const handler = () => null;
    const component = renderCardSmall({
      cardType: "PAYPAL",
      onCardPress: handler,
      testID
    });
    expect(component.queryByTestId(`${testID}-pressable`)).not.toBeNull();
  });

  it(`should render an error icon in case of error `, () => {
    const component = renderCardSmall({
      cardType: "PAYPAL",
      isError: true,
      testID
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId(`${testID}-errorIcon`)).not.toBeNull();
  });
  it(`should not render a pressable if no handler is passed`, () => {
    const component = renderCardSmall({
      cardType: "PAYPAL",
      isError: true,
      testID
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId(`${testID}-pressable`)).toBeNull();
  });
  it(`should render a skeleton if loading`, () => {
    const component = renderCardSmall({
      isLoading: true,
      testID
    });
    expect(component.queryByTestId(`${testID}-skeleton`)).not.toBeNull();
  });
});

function renderCardSmall(props: PaymentCardSmallProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentCardSmall {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
