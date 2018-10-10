import { cleanPaymentDescription } from "../cleanPaymentDescription";

describe("cleanPaymentDescription", () => {
  it("should remove the tag returning just the description", () => {
    const cleanedPaymentDescription = cleanPaymentDescription(
      "/RFB/0123456789012/666.98/TXT/ actual description"
    );

    expect(cleanedPaymentDescription).toBe("actual description");
  });
});
