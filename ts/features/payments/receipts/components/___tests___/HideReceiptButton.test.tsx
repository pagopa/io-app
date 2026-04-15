import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import I18n from "i18next";
import HideReceiptButton from "../HideReceiptButton";

jest.spyOn(Alert, "alert");

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: mockNavigate,
    setOptions: jest.fn()
  })
}));
jest.mock("../../../../../store/hooks", () => ({
  useDispatch: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn
}));

const renderComponent = () =>
  render(
    <NavigationContainer>
      <HideReceiptButton transactionId="12345" />
    </NavigationContainer>
  );

describe("HideReceiptButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("features.payments.transactions.receipt.hideFromList"))
    ).toBeTruthy();
  });

  it("should display Alert on press", () => {
    const { getByText } = renderComponent();
    const hideButton = getByText(
      I18n.t("features.payments.transactions.receipt.hideFromList")
    );

    fireEvent.press(hideButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("features.payments.transactions.receipt.hideBanner.title"),
      I18n.t("features.payments.transactions.receipt.hideBanner.content"),
      expect.any(Array),
      { cancelable: false }
    );
  });
});
