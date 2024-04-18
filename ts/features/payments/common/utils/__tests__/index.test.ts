import { format } from "date-fns";
import { isPaymentMethodExpired } from "..";

describe("isPaymentMethodExpired", () => {
  it("should return true if payment method is expired", () => {
    const result = isPaymentMethodExpired({ expiryDate: "202103" });
    expect(result).toBeTruthy();
  });
  it("should return false if payment method expires this month", () => {
    const result = isPaymentMethodExpired({
      expiryDate: format(new Date(), "yyyyMM")
    });
    expect(result).toBeFalsy();
  });
  it("should return false if payment method expires in the future", () => {
    const now = new Date();
    const result = isPaymentMethodExpired({
      expiryDate: format(
        new Date(now.getFullYear() + 2, now.getMonth()),
        "yyyyMM"
      )
    });
    expect(result).toBeFalsy();
  });
});
