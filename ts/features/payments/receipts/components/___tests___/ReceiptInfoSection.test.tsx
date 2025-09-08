import Clipboard from "@react-native-clipboard/clipboard";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import {
  OriginEnum,
  PaymentMethodEnum
} from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import ReceiptInfoSection from "../ReceiptInfoSection";

const mockTransaction: NoticeDetailResponse = {
  infoNotice: {
    payer: {
      name: "John Doe",
      taxCode: "ABCDEF12G"
    },
    paymentMethod: PaymentMethodEnum.AD,
    walletInfo: {
      blurredNumber: "**** **** **** 1234",
      brand: "Visa",
      maskedEmail: "john.doe@example.com",
      accountHolder: "John Doe"
    },
    pspName: "Test PSP",
    noticeDate: "2023-10-01T12:00:00Z",
    rrn: "123456789",
    authCode: "987654",
    eventId: "event123",
    origin: OriginEnum.PM,
    amount: "100.00"
  }
};

describe("ReceiptInfoSection", () => {
  it("renders loading skeletons when loading is true", () => {
    const { getAllByTestId } = render(<ReceiptInfoSection loading={true} />);
    expect(getAllByTestId("skeleton-item").length).toBeGreaterThan(0);
  });

  it("renders transaction information correctly when transaction data is provided", () => {
    const { getByText } = render(
      <ReceiptInfoSection
        transaction={mockTransaction}
        loading={false}
        showUnavailableReceiptBanner
      />
    );

    // Payer Info
    expect(
      getByText(I18n.t("transaction.details.info.executedBy"))
    ).toBeTruthy();

    // Payment Method
    expect(
      getByText(I18n.t("transaction.details.info.paymentMethod"))
    ).toBeTruthy();
    expect(getByText("Visa ••••    1234")).toBeTruthy();

    // PSP Name
    expect(getByText(I18n.t("transaction.details.info.pspName"))).toBeTruthy();
    expect(getByText("Test PSP")).toBeTruthy();

    // Date and Hour
    expect(
      getByText(I18n.t("transaction.details.info.dateAndHour"))
    ).toBeTruthy();

    // RRN with Copy Button
    const rrnElement = getByText("123456789");
    expect(rrnElement).toBeTruthy();
    fireEvent.press(rrnElement);

    // Auth Code
    expect(getByText(I18n.t("transaction.details.info.authCode"))).toBeTruthy();
    expect(getByText("987654")).toBeTruthy();

    // Event ID with Copy Button
    const eventIdElement = getByText("event123");
    fireEvent.press(eventIdElement);

    expect(Clipboard.setString).toHaveBeenCalledWith(
      mockTransaction.infoNotice?.rrn
    );

    // Alert for Imported Transactions
    expect(
      getByText(I18n.t("transaction.details.bannerImported.content"))
    ).toBeTruthy();
  });

  it("does not render sections if transaction data is missing", () => {
    const { queryByText } = render(<ReceiptInfoSection loading={false} />);
    expect(
      queryByText(I18n.t("transaction.details.info.executedBy"))
    ).toBeNull();
  });

  it("renders PayPal instead of credit card if only maskedEmail is provided", () => {
    const paypalTransaction: NoticeDetailResponse = {
      ...mockTransaction,
      infoNotice: {
        ...mockTransaction.infoNotice,
        walletInfo: {
          maskedEmail: "john.doe@example.com"
        },
        pspName: "Test PSP",
        noticeDate: "2023-10-01T12:00:00Z",
        rrn: "123456789",
        eventId: "event123",
        origin: OriginEnum.PM,
        amount: "100.00"
      }
    };
    const { getByText } = render(
      <ReceiptInfoSection transaction={paypalTransaction} loading={false} />
    );

    expect(
      getByText(I18n.t("transaction.details.info.paymentMethod"))
    ).toBeTruthy();
    expect(getByText("PayPal")).toBeTruthy();
  });
});
