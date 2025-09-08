import { render } from "@testing-library/react-native";
import I18n from "i18next";
import {
  InfoNotice,
  OriginEnum
} from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import ReceiptFeeAmountSection from "../ReceiptFeeAmountSection";

describe("ReceiptFeeAmountSection", () => {
  it("renders loading state correctly", () => {
    const { getByTestId } = render(<ReceiptFeeAmountSection loading />);
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
      <ReceiptFeeAmountSection
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
    const { getByText } = render(<ReceiptFeeAmountSection loading={false} />);
    expect(
      getByText(
        I18n.t("features.payments.transactions.details.totalFeeUnknownPsp")
      )
    ).toBeTruthy();
  });
});
