import { render } from "@testing-library/react-native";
import React from "react";
import I18n from "../../../../../i18n";
import { NoticeTotalAmount } from "../NoticeTotalAmount";
import { formatAmountText } from "../../utils";
describe("NoticeTotalAmount", () => {
  it("should render loading placeholder when loading is true", () => {
    const { getByTestId } = render(<NoticeTotalAmount loading />);

    expect(getByTestId("loader")).toBeTruthy();
  });

  it("should render total amount when loading is false and totalAmount is provided", () => {
    const { getByText } = render(
      <NoticeTotalAmount loading={false} totalAmount="100" />
    );
    expect(getByText(I18n.t("transaction.details.totalAmount"))).toBeTruthy();

    expect(getByText(formatAmountText("100"))).toBeTruthy();
  });

  it("should not render total amount when loading is true", () => {
    const { queryByText } = render(
      <NoticeTotalAmount loading={true} totalAmount="100" />
    );

    expect(queryByText("€100")).toBeNull();
  });

  it("should not render total amount when totalAmount is not provided", () => {
    const { queryByText } = render(<NoticeTotalAmount loading={false} />);

    expect(queryByText("€")).toBeNull();
  });
});
