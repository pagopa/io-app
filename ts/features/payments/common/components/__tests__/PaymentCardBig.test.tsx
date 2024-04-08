import { default as React } from "react";
import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentCardBig, PaymentCardBigProps } from "../PaymentCardBig";

describe("PaymentCardBig component", () => {
  const testID = "PaymentCardBigTestID";
  jest.useFakeTimers();
  it(`matches snapshot for loading`, () => {
    const component = renderCardBig({ isLoading: true });
    expect(component).toMatchSnapshot();
  });
  it(`matches snapshot for paypal`, () => {
    const component = renderCardBig({
      cardType: "PAYPAL",
      holderEmail: "someEmail@test.com"
    });
    expect(component).toMatchSnapshot();
  });

  it(`should render a phone number in case of BancomatPay`, () => {
    const component = renderCardBig({
      cardType: "BANCOMATPAY",
      phoneNumber: "1234567890",
      holderName: "holderName",
      testID
    });
    expect(component).not.toBeNull();
    expect(component.queryByText("1234567890")).not.toBeNull();
  });
  it(`should render a skeleton when loading`, () => {
    const component = renderCardBig({
      isLoading: true,
      testID
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId(`${testID}-skeleton`)).not.toBeNull();
  });
});

function renderCardBig(props: PaymentCardBigProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentCardBig {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
