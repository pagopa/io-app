import { decodeIOBarcode } from "../decoders";

describe("test decodeIOBarcode function", () => {
  it("should return unknown if empty value", () => {
    const value = "";
    const output = decodeIOBarcode(value);

    expect(output).toStrictEqual({ type: "UNKNOWN", value });
  });

  describe("test IDPAY barcode type", () => {
    it("should return IDPAY on valid QRCode content", () => {
      const trxCode = "mkdb1yxg";
      const value = "https://continua.io.pagopa.it/idpay/auth/" + trxCode;
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual({ type: "IDPAY", authUrl: value, trxCode });
    });
    it("should return UNKNOWN on invalid QR content", () => {
      const value = "https://continua.io.pagopa.it/idpay/auth/pippo";
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual({ type: "UNKNOWN", value });
    });
  });
});
