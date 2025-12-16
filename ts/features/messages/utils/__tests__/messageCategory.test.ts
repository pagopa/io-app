import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { foldMessageCategoryK } from "../messageCategory";

describe("foldMessageCategoryK", () => {
  it("should call 'onGeneral' callback with 'LEGAL_MESSAGE' tag for legal message category", () => {
    const category = {
      tag: "LEGAL_MESSAGE"
    } as MessageCategory;
    const mockGeneralCategoryFN = jest.fn();
    const mockPaymentCategoryFN = jest.fn();
    const mockSendCategoryFN = jest.fn();
    foldMessageCategoryK(
      mockGeneralCategoryFN,
      mockPaymentCategoryFN,
      mockSendCategoryFN
    )(category);
    expect(mockGeneralCategoryFN.mock.calls.length).toBe(1);
    expect(mockGeneralCategoryFN.mock.calls[0][0]).toStrictEqual(category.tag);
    expect(mockPaymentCategoryFN.mock.calls.length).toBe(0);
    expect(mockSendCategoryFN.mock.calls.length).toBe(0);
  });
  it("should call 'onGeneral' callback with 'EU_COVID_CERT' tag for green pass category", () => {
    const category = {
      tag: "EU_COVID_CERT",
      rptId: "00123456789001122334455667788"
    } as MessageCategory;
    const mockGeneralCategoryFN = jest.fn();
    const mockPaymentCategoryFN = jest.fn();
    const mockSendCategoryFN = jest.fn();
    foldMessageCategoryK(
      mockGeneralCategoryFN,
      mockPaymentCategoryFN,
      mockSendCategoryFN
    )(category);
    expect(mockGeneralCategoryFN.mock.calls.length).toBe(1);
    expect(mockGeneralCategoryFN.mock.calls[0][0]).toStrictEqual(category.tag);
    expect(mockPaymentCategoryFN.mock.calls.length).toBe(0);
    expect(mockSendCategoryFN.mock.calls.length).toBe(0);
  });
  it("should call 'onGeneral' callback with 'GENERIC' tag for generic category", () => {
    const category = {
      tag: "GENERIC"
    } as MessageCategory;
    const mockGeneralCategoryFN = jest.fn();
    const mockPaymentCategoryFN = jest.fn();
    const mockSendCategoryFN = jest.fn();
    foldMessageCategoryK(
      mockGeneralCategoryFN,
      mockPaymentCategoryFN,
      mockSendCategoryFN
    )(category);
    expect(mockGeneralCategoryFN.mock.calls.length).toBe(1);
    expect(mockGeneralCategoryFN.mock.calls[0][0]).toStrictEqual(category.tag);
    expect(mockPaymentCategoryFN.mock.calls.length).toBe(0);
    expect(mockSendCategoryFN.mock.calls.length).toBe(0);
  });
  it("should call 'onPayment' callback with the category instance for payment category", () => {
    const category = {
      tag: "PAYMENT"
    } as MessageCategory;
    const mockGeneralCategoryFN = jest.fn();
    const mockPaymentCategoryFN = jest.fn();
    const mockSendCategoryFN = jest.fn();
    foldMessageCategoryK(
      mockGeneralCategoryFN,
      mockPaymentCategoryFN,
      mockSendCategoryFN
    )(category);
    expect(mockGeneralCategoryFN.mock.calls.length).toBe(0);
    expect(mockPaymentCategoryFN.mock.calls.length).toBe(1);
    expect(mockPaymentCategoryFN.mock.calls[0][0]).toStrictEqual(category);
    expect(mockSendCategoryFN.mock.calls.length).toBe(0);
  });
  it("should call 'onSend' callback with the category instance for SEND category", () => {
    const category = {
      tag: "PN",
      id: "1",
      original_sender: "01J0XCKH2XWRQTS2YBZ2XT3DS5",
      original_receipt_date: new Date(),
      has_attachments: true,
      has_remote_content: true,
      has_precondition: "ALWAYS",
      summary: "This is the summary",
      configuration_id: "01J0XCFED9HC3W5Y1TH80MEN6A"
    } as MessageCategory;
    const mockGeneralCategoryFN = jest.fn();
    const mockPaymentCategoryFN = jest.fn();
    const mockSendCategoryFN = jest.fn();
    foldMessageCategoryK(
      mockGeneralCategoryFN,
      mockPaymentCategoryFN,
      mockSendCategoryFN
    )(category);
    expect(mockGeneralCategoryFN.mock.calls.length).toBe(0);
    expect(mockPaymentCategoryFN.mock.calls.length).toBe(0);
    expect(mockSendCategoryFN.mock.calls.length).toBe(1);
    expect(mockSendCategoryFN.mock.calls[0][0]).toStrictEqual(category);
  });
});
