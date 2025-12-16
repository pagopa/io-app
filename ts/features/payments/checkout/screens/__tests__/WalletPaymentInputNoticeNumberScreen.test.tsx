import { fireEvent } from "@testing-library/react-native";
import { default as configureMockStore } from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { WalletPaymentInputNoticeNumberScreen } from "../WalletPaymentInputNoticeNumberScreen";

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
    WalletPaymentInputNoticeNumberScreen,
    PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER,
    {},
    store
  );
};

describe("WalletPaymentInputNoticeNumberScreen", () => {
  it(`should render the WalletPaymentInputNoticeNumberScreen`, () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it("should update the state when input changes", () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId("noticeNumberInput");

    fireEvent.changeText(input, "123456789012345678");
    expect(input.props.value).toBe("123456789012345678");
  });

  it("should navigate to the next screen when input is valid", () => {
    const { getByText, getByTestId } = renderComponent();
    const input = getByTestId("noticeNumberInput");
    const button = getByText(I18n.t("global.buttons.continue"));

    fireEvent.changeText(input, "123456789012345678");
    fireEvent.press(button);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
      {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE,
        params: {
          paymentNoticeNumber: expect.any(Object)
        }
      }
    );
  });

  it("should show an error when input is invalid", () => {
    const { getByText, getByTestId } = renderComponent();
    const input = getByTestId("noticeNumberInput");
    const button = getByText(I18n.t("global.buttons.continue"));

    fireEvent.changeText(input, "invalid");
    fireEvent.press(button);

    expect(
      getByText(I18n.t("wallet.payment.manual.noticeNumber.validationError"))
    ).toBeTruthy();
  });
});
