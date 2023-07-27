import * as O from "fp-ts/lib/Option";
import { decodeIOBarcode } from "../decoders";
import { IO_BARCODE_ALL_TYPES } from "../IOBarcode";

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
    it("should return O.none with valid content and IDPAY type not supported", () => {
      const value = "https://continua.io.pagopa.it/idpay/auth/mkdb1yxg";
      const output = decodeIOBarcode(value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "IDPAY")
      });

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test PAGOPA QRCode barcode type", () => {
    it("should return PAGOPA on valid QRCode content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158|0000015000";
      const output = O.toUndefined(decodeIOBarcode(value));

      expect(output).toHaveProperty("type", "PAGOPA");
      expect(output).toHaveProperty("amount", "0000015000");
    });
    it("should return UNKNOWN on invalid QRCode content", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158";
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual(O.none);
    });
    it("should return O.none with valid content and PAGOPA type not supported", () => {
      const value = "PAGOPA|002|000000000000000000|01199250158|0000015000";
      const output = decodeIOBarcode(value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "PAGOPA")
      });

      expect(output).toStrictEqual(O.none);
    });
  });

  describe("test PAGOPA DataMatrix barcode type", () => {
    it("should return PAGOPA on valid DataMatrix content", () => {
      const value =
        "codfase=NBPA;183007157000000000321200001630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = O.toUndefined(decodeIOBarcode(value));

      expect(output).toHaveProperty("type", "PAGOPA");
      expect(output).toHaveProperty("amount", "0000000001");
    });
    it("should return UNKNOWN on invalid DataMatrix content", () => {
      const value =
        "codfase=NBPA;1830071A7000000000321200E01630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = decodeIOBarcode(value);

      expect(output).toStrictEqual(O.none);
    });
    it("should return O.none with valid content and PAGOPA type not supported", () => {
      const value =
        "codfase=NBPA;1830071A7000000000321200E01630209310000000000138961P100085240950BSCMTT83A12L719RName Surname                           test                                                                                                                      A";
      const output = decodeIOBarcode(value, {
        barcodeTypes: IO_BARCODE_ALL_TYPES.filter(t => t !== "PAGOPA")
      });

      expect(output).toStrictEqual(O.none);
    });
  });
});
