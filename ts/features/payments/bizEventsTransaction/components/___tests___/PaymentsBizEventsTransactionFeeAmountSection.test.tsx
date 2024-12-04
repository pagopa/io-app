import { render } from "@testing-library/react-native";
import * as React from "react";
import {
  InfoNotice,
  OriginEnum
} from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import I18n from "../../../../../i18n";
import PaymentsBizEventsTransactionFeeAmountSection from "../PaymentsBizEventsTransactionFeeAmountSection";

describe("PaymentsBizEventsTransactionFeeAmountSection", () => {
  it("renders loading state correctly", () => {
    const { getByTestId } = render(
      <PaymentsBizEventsTransactionFeeAmountSection loading />
    );
    expect(getByTestId("loading-placeholder")).toBeTruthy();
  });

  it("renders unknown fee message when fee is not provided", () => {
    const transactionInfo: InfoNotice = {
      pspName: "Test PSP",
      eventId: "123",
      noticeDate: "2021-01-01",
      rrn: "123",
      amount: "100",
      origin: OriginEnum.UNKNOWN
    };
    const { getByText } = render(
      <PaymentsBizEventsTransactionFeeAmountSection
        loading={false}
        transactionInfo={transactionInfo}
      />
    );
    expect(
      getByText(
        I18n.t("features.payments.transactions.details.totalFeeUnknown", {
          pspName: "Test PSP"
        })
      )
    ).toBeTruthy();
  });

  it("renders unknown fee message when fee and pspName are not provided", () => {
    const { getByText } = render(
      <PaymentsBizEventsTransactionFeeAmountSection loading={false} />
    );
    expect(
      getByText(
        I18n.t("features.payments.transactions.details.totalFeeUnknownPsp")
      )
    ).toBeTruthy();
  });
});
