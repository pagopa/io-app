import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentCardSmall, PaymentCardSmallProps } from "../PaymentCardSmall";

describe("PaymentCardSmall", () => {
  const testID = "PaymentCardSmallTestID";
  jest.useFakeTimers();

  it(`should match the snapshot`, () => {
    const component = renderCard({
      hpan: "9900",
      brand: "maestro",
      onPress: () => undefined,
      testID
    });
    expect(component).toMatchSnapshot();
  });

  it(`should render card without pressable wrapper`, () => {
    const { queryByTestId } = renderCard({
      testID
    });
    expect(queryByTestId(`${testID}-pressable`)).toBeNull();
  });

  it(`should render credit card details`, () => {
    const { queryByText, queryByTestId } = renderCard({
      hpan: "9900",
      brand: "maestro",
      onPress: () => undefined,
      testID
    });
    expect(queryByText("•••• 9900")).not.toBeNull();
    expect(queryByTestId(`${testID}-errorIcon`)).toBeNull();
    expect(queryByTestId(`${testID}-pressable`)).not.toBeNull();
  });

  it(`should render error card`, () => {
    const { queryByText, queryByTestId } = renderCard({
      expireDate: new Date(2023),
      isExpired: true,
      hpan: "9900",
      brand: "maestro",
      onPress: () => undefined,
      testID
    });
    expect(queryByText("•••• 9900")).not.toBeNull();
    expect(queryByTestId(`${testID}-errorIcon`)).not.toBeNull();
    expect(queryByTestId(`${testID}-pressable`)).not.toBeNull();
  });

  it(`should render paypal card details`, () => {
    const { queryByText, queryByTestId } = renderCard({
      holderEmail: "test@test.it",
      onPress: () => undefined,
      testID
    });
    expect(queryByText("PayPal")).not.toBeNull();
    expect(queryByTestId(`${testID}-pressable`)).not.toBeNull();
  });

  it(`should render bpay card details`, () => {
    const { queryByText, queryByTestId } = renderCard({
      holderPhone: "1234",
      onPress: () => undefined,
      testID
    });
    expect(queryByText("BANCOMAT Pay")).not.toBeNull();
    expect(queryByTestId(`${testID}-pressable`)).not.toBeNull();
  });
});

function renderCard(props: PaymentCardSmallProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentCardSmall {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
