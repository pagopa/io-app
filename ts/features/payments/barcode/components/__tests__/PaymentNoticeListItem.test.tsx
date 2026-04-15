import { AmountInEuroCents } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { render } from "@testing-library/react-native";
import { voidType } from "io-ts";
import { PaymentNoticeListItem } from "../PaymentNoticeListItem";

describe("PaymentNoticeListItem", () => {
  it("should render without crashing", () => {
    const { getByText } = render(
      <PaymentNoticeListItem
        amountInEuroCents={"10.00" as AmountInEuroCents}
        onPress={() => voidType}
        organizationFiscalCode="1312312321"
        paymentNoticeNumber="1234567890"
      />
    );
    expect(getByText("1234567890")).toBeDefined();
  });

  it("should render with an invalid/null amount", () => {
    const { getByText } = render(
      <PaymentNoticeListItem
        amountInEuroCents={null as unknown as AmountInEuroCents}
        onPress={() => voidType}
        organizationFiscalCode="1312312321"
        paymentNoticeNumber="1234567890"
      />
    );
    expect(getByText("0,00 €")).toBeDefined(); // empty string fallback
  });
});
