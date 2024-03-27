import { render } from "@testing-library/react-native";
import { format } from "date-fns";
import { default as React } from "react";
import { createStore } from "redux";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentCard } from "../PaymentCard";
import { PaymentCardBig, PaymentCardBigProps } from "../PaymentCardBig";
import { PaymentCardSmall, PaymentCardSmallProps } from "../PaymentCardSmall";

describe("PaymentCard", () => {
  jest.useFakeTimers();
  it(`should match snapshot for loading`, () => {
    const component = render(<PaymentCard isLoading={true} />);
    expect(component).toMatchSnapshot();
  });
  it(`should render credit card data`, () => {
    const tDate = new Date();
    const { queryByText } = render(
      <PaymentCard brand="mastercard" hpan="1234" expireDate={tDate} />
    );

    expect(queryByText("Mastercard •••• 1234")).not.toBeNull();
    expect(
      queryByText(
        I18n.t("wallet.creditCard.validUntil", {
          expDate: format(tDate, "MM/YY")
        })
      )
    ).not.toBeNull();
  });
  it(`should render bancomat data`, () => {
    const tDate = new Date();
    const { queryByTestId, queryByText } = render(
      <PaymentCard abiCode="1234" expireDate={tDate} holderName="Anna Verdi" />
    );

    expect(queryByTestId("paymentCardBankLogoTestId")).not.toBeNull();
    expect(queryByText("Mastercard •••• 1234")).toBeNull();
    expect(queryByText("Anna Verdi")).not.toBeNull();
    expect(
      queryByText(
        I18n.t("wallet.creditCard.validUntil", {
          expDate: format(tDate, "MM/YY")
        })
      )
    ).not.toBeNull();
  });
  it(`should render BPay data`, () => {
    const { queryByTestId, queryByText } = render(
      <PaymentCard holderPhone="123456789" />
    );
    expect(queryByTestId("paymentCardBPayLogoTestId")).not.toBeNull();
    expect(queryByText("123456789")).not.toBeNull();
  });
  it(`should render PayPal data`, () => {
    const { queryByTestId, queryByText } = render(
      <PaymentCard holderEmail="abc@abc.it" />
    );
    expect(queryByTestId("paymentCardPayPalLogoTestId")).not.toBeNull();
    expect(queryByText("abc@abc.it")).not.toBeNull();
  });
});

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

function renderCardSmall(props: PaymentCardSmallProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentCardSmall {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
