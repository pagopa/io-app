import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NoticeCartList } from "../NoticeCartList";
import { CartItem } from "../../../../../../definitions/pagopa/biz-events/CartItem";

describe("NoticeCartList", () => {
  const mockOnPress = jest.fn();
  const cartItems: ReadonlyArray<CartItem> = [
    {
      refNumberValue: "123",
      subject: "Test Subject 1",
      refNumberType: "Test Ref Number Type 1",
      debtor: { name: "Test Debtor 1", taxCode: "Test Tax Code 1" },
      amount: "1000"
    },
    {
      refNumberValue: "456",
      subject: "Test Subject 2",
      refNumberType: "Test Ref Number Type 2",
      debtor: { name: "Test Debtor 2", taxCode: "Test Tax Code 2" },
      amount: "2000"
    }
  ];

  it("should render loading state", () => {
    const { getByTestId } = render(
      <NoticeCartList loading={true} onPress={mockOnPress} />
    );
    expect(getByTestId("skeleton-transaction-details-list")).toBeTruthy();
  });

  it("should render cart items", () => {
    const { getByText } = render(
      <NoticeCartList carts={cartItems} loading={false} onPress={mockOnPress} />
    );

    expect(getByText("Test Subject 1")).toBeTruthy();
    expect(getByText("Test Subject 2")).toBeTruthy();
  });

  it("should call onPress when a cart item is pressed", () => {
    const { getByText } = render(
      <NoticeCartList carts={cartItems} loading={false} onPress={mockOnPress} />
    );

    fireEvent.press(getByText("Test Subject 1"));
    expect(mockOnPress).toHaveBeenCalledWith(cartItems[0]);

    fireEvent.press(getByText("Test Subject 2"));
    expect(mockOnPress).toHaveBeenCalledWith(cartItems[1]);
  });

  it("should render null when carts are not provided", () => {
    const { queryByText } = render(
      <NoticeCartList loading={false} onPress={mockOnPress} />
    );

    expect(queryByText("Test Subject 1")).toBeNull();
    expect(queryByText("Test Subject 2")).toBeNull();
  });
});
