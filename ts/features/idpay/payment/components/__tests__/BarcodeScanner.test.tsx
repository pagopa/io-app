import * as O from "fp-ts/lib/Option";
import { Barcode, BarcodeFormat } from "vision-camera-code-scanner";
import { getIOBarcodeType, retrieveNextBarcode } from "../BarcodeScanner";

describe("test retrieveNextBarcode function", () => {
  it("should return `O.none` because of an empty array as input", () => {
    const input: Array<Barcode> = [];
    const output = retrieveNextBarcode(input);

    expect(output).toBe(O.none);
  });

  it("should return the Data Matrix barcode because it's the only one", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.DATA_MATRIX } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe("DATA_MATRIX");
  });

  it("should return the QR Code barcode because it's the only one", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.QR_CODE } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe("QR_CODE");
  });
  it("should return the QR Code barcode because it has the higher priority", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.DATA_MATRIX } as Barcode,
      { format: BarcodeFormat.QR_CODE } as Barcode,
      { format: BarcodeFormat.CODE_128 } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe("QR_CODE");
  });

  it("should return the Data Matrix barcode because it has the higher priority", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.CODE_39 } as Barcode,
      { format: BarcodeFormat.ITF } as Barcode,
      { format: BarcodeFormat.DATA_MATRIX } as Barcode,
      { format: BarcodeFormat.CODE_128 } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe("DATA_MATRIX");
  });
});

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
