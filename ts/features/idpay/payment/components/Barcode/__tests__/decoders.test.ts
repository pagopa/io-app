import { decodeIOBarcode } from "../decoders";

describe("test decodeIOBarcode function", () => {
  it("should return unknown if empty value", () => {
    const input = "";
    const output = decodeIOBarcode(input);

    expect(output).toStrictEqual({ type: "UNKNOWN" });
  });

  describe("test IDPAY barcode type", () => {
    it("should return IDPAY on valid QRCode content", () => {
      const trxCode = "mkdb1yxg";
      const input = "https://continua.io.pagopa.it/idpay/auth/" + trxCode;
      const output = decodeIOBarcode(input);

      expect(output).toStrictEqual({ type: "IDPAY", authUrl: input, trxCode });
    });
    it("should return UNKNOWN on invalid QR content", () => {
      const input = "https://continua.io.pagopa.it/idpay/auth/pippo";
      const output = decodeIOBarcode(input);

      expect(output).toStrictEqual({ type: "UNKNOWN" });
    });
  });
});
