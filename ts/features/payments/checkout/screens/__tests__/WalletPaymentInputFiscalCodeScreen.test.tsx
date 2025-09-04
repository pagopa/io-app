import { fireEvent } from "@testing-library/react-native";
import { default as configureMockStore } from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { WalletPaymentInputFiscalCodeScreen } from "../WalletPaymentInputFiscalCodeScreen";

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn()
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation
}));

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletPaymentInputFiscalCodeScreen,
    PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE,
    {},
    store
  );
};

describe("WalletPaymentInputFiscalCodeScreen", () => {
  it(`should render the WalletPaymentInputFiscalCodeScreen`, () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it("should update the state when input changes", () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId("fiscalCodeInput");

    fireEvent.changeText(input, "12345678901");
    expect(input.props.value).toBe("12345678901");
  });

  it("should show an error when input is invalid", () => {
    const { getByText, getByTestId } = renderComponent();
    const input = getByTestId("fiscalCodeInput");
    const button = getByText(I18n.t("global.buttons.continue"));

    fireEvent.changeText(input, "invalid");
    fireEvent.press(button);

    expect(
      getByText(I18n.t("wallet.payment.manual.fiscalCode.validationError"))
    ).toBeTruthy();
  });
});
