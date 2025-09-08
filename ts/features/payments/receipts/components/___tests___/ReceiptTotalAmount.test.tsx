import { render } from "@testing-library/react-native";
import I18n from "i18next";
import { ReceiptTotalAmount } from "../ReceiptTotalAmount";
import { formatAmountText } from "../../utils";
describe("ReceiptTotalAmount", () => {
  it("should render loading placeholder when loading is true", () => {
    const { getByTestId } = render(<ReceiptTotalAmount loading />);

    expect(getByTestId("loader")).toBeTruthy();
  });

  it("should render total amount when loading is false and totalAmount is provided", () => {
    const { getByText } = render(
      <ReceiptTotalAmount loading={false} totalAmount="100" />
    );
    expect(getByText(I18n.t("transaction.details.totalAmount"))).toBeTruthy();

    expect(getByText(formatAmountText("100"))).toBeTruthy();
  });

  it("should not render total amount when loading is true", () => {
    const { queryByText } = render(
      <ReceiptTotalAmount loading={true} totalAmount="100" />
    );

    expect(queryByText("€100")).toBeNull();
  });

  it("should not render total amount when totalAmount is not provided", () => {
    const { queryByText } = render(<ReceiptTotalAmount loading={false} />);

    expect(queryByText("€")).toBeNull();
  });
});
