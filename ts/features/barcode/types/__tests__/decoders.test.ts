import * as O from "fp-ts/lib/Option";
import { decodeIOBarcode } from "../decoders";

describe("test decodeIOBarcode function", () => {
  it("should return unknown if empty value", () => {
    const value = "";
    const output = decodeIOBarcode(value);

    expect(output).toStrictEqual(O.none);
  });

  describe("test IDPAY barcode type", () => {
    it("should return O.some on valid QRCode content", () => {
      const trxCode = "mkdb1yxg";
      const value = "https://continua.io.pagopa.it/idpay/auth/" + trxCode;
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual(
        O.some({ type: "IDPAY", authUrl: value, trxCode })
      );
    });
    it("should return O.none on invalid QR content", () => {
      const value = "https://continua.io.pagopa.it/idpay/auth/pippo";
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test PAGOPA barcode type", () => {
    it("should return PAGOPA on valid QRCode content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158|0000015000";
      const output = decodeIOBarcode(value);

      expect(output).toHaveProperty("type", "PAGOPA");
      expect(output).toHaveProperty("amount", "0000015000");
    });
    it("should return UNKNOWN on invalid QR content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158";
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual({ type: "UNKNOWN", value });
    });
  });
});
