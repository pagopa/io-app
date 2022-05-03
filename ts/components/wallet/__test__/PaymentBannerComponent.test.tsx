import * as React from "react";
import { render } from "@testing-library/react-native";
import PaymentBannerComponent from "../PaymentBannerComponent";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";

describe("PaymentBannerComponent", () => {
  describe("given a transaction fee", () => {
    const currentAmount = 1500;
    const fee = 1000;
    const transactionWithFee = {
      paymentReason: "test",
      currentAmount: currentAmount as ImportoEuroCents,
      fee: fee as ImportoEuroCents
    };

    it("renders the fee localized with the currency", () => {
      const fixture = formatNumberCentsToAmount(fee, true);
      const component = render(
        <PaymentBannerComponent {...transactionWithFee} />
      );
      expect(
        component.queryByTestId("PaymentBannerComponentFee")
      ).toHaveTextContent(fixture);
    });

    it("renders the sum of current amount and fee as total", () => {
      const fixture = formatNumberCentsToAmount(currentAmount + fee, true);
      const component = render(
        <PaymentBannerComponent {...transactionWithFee} />
      );
      expect(
        component.queryByTestId("PaymentBannerComponentTotal")
      ).toHaveTextContent(fixture);
    });
  });

  describe("given no transaction fee", () => {
    const currentAmount = 1500;
    const fee = 0;
    const transactionWithoutFee = {
      paymentReason: "test",
      currentAmount: currentAmount as ImportoEuroCents,
      fee: fee as ImportoEuroCents
    };

    it("renders 0 localized with the currency as fee", () => {
      const fixture = formatNumberCentsToAmount(0, true);
      const component = render(
        <PaymentBannerComponent {...transactionWithoutFee} />
      );
      expect(
        component.queryByTestId("PaymentBannerComponentFee")
      ).toHaveTextContent(fixture);
    });

    it("renders the current amount as total", () => {
      const fixture = formatNumberCentsToAmount(currentAmount, true);
      const component = render(
        <PaymentBannerComponent {...transactionWithoutFee} />
      );
      expect(
        component.queryByTestId("PaymentBannerComponentTotal")
      ).toHaveTextContent(fixture);
    });
  });
});
