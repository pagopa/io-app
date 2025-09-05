import { render } from "@testing-library/react-native";
import { format } from "date-fns";
import I18n from "i18next";
import { PaymentCard } from "../PaymentCard";

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

  it(`should render error card`, () => {
    const { queryByTestId, queryByText } = render(
      <PaymentCard
        holderEmail="abc@abc.it"
        isExpired={true}
        testID="paymentCardTestID"
      />
    );
    expect(queryByTestId("paymentCardPayPalLogoTestId")).not.toBeNull();
    expect(queryByTestId("paymentCardTestID-expired")).not.toBeNull();
    expect(queryByText("abc@abc.it")).not.toBeNull();
  });
});
