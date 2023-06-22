import { getIOBarcodeType } from "../IOBarcode";

describe("test getIOBarcodeType function", () => {
  it("should return unknown if empty value", () => {
    const input = "";
    const output = getIOBarcodeType(input);

    expect(output).toBe("UNKNOWN");
  });

  describe("test IDPAY barcode type", () => {
    it("should return IDPAY on valid QRCode content", () => {
      const input = "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg";
      const output = getIOBarcodeType(input);

      expect(output).toBe("IDPAY");
    });
    it("should return UNKNOWN on invalid QR content", () => {
      const input = "https://continua.io.pagopa.it/idpay/auth/pippo";
      const output = getIOBarcodeType(input);

      expect(output).toBe("UNKNOWN");
    });
  });
});
