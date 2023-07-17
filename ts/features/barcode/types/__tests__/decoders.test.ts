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
});
