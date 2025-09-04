import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import { JSX } from "react";
import I18n from "i18next";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { ReceiptListItemTransaction } from "../ReceiptListItemTransaction";

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

const mockTransaction: NoticeListItem = {
  eventId: "123",
  isCart: false,
  payeeName: "Test Payee",
  amount: "1000",
  noticeDate: "2023-01-01T10:00:00Z",
  isDebtor: false,
  isPayer: false,
  payeeTaxCode: "ABCDEF12G"
};

const mockCartTransaction: NoticeListItem = {
  eventId: "456",
  isCart: true,
  amount: "2000",
  noticeDate: "2023-01-02T12:00:00Z",
  isDebtor: false,
  isPayer: false,
  payeeTaxCode: "XYZ12345"
};

const renderWithNavigation = (component: JSX.Element) =>
  render(<NavigationContainer>{component}</NavigationContainer>);

describe("ReceiptListItemTransaction", () => {
  it("renders correctly with a single transaction", () => {
    const { getByText } = renderWithNavigation(
      <ReceiptListItemTransaction transaction={mockTransaction} />
    );

    expect(getByText("Test Payee")).toBeTruthy();
    expect(getByText("01 gen 2023, 10:00")).toBeTruthy();
  });

  it("renders correctly with a cart transaction", () => {
    const { getByText } = renderWithNavigation(
      <ReceiptListItemTransaction transaction={mockCartTransaction} />
    );

    expect(
      getByText(I18n.t("features.payments.transactions.multiplePayment"))
    ).toBeTruthy();
    expect(getByText("02 gen 2023, 12:00")).toBeTruthy();
  });

  it("calls onPress when the item is pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = renderWithNavigation(
      <ReceiptListItemTransaction
        transaction={mockTransaction}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText("Test Payee"));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
