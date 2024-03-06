import { getRptIdStringFromPaymentData } from "..";
import { PaymentData } from "../../types";

describe("getRptIdStringFromPaymentData", () => {
  it("should properly format the RptID", () => {
    const fiscalCode = "01234567890";
    const noticeNumber = "012345678912345610";
    const paymentData = {
      noticeNumber,
      payee: {
        fiscalCode
      }
    } as PaymentData;
    const rptId = getRptIdStringFromPaymentData(paymentData);
    expect(rptId).toBe(`${fiscalCode}${noticeNumber}`);
  });
});
