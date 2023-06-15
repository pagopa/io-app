import * as O from "fp-ts/lib/Option";
import { Barcode, BarcodeFormat } from "vision-camera-code-scanner";
import { retrieveNextBarcode, useIOBarcodeScanner } from "../BarcodeScanner";

describe("test retrieveNextBarcode function", () => {
  it("should return `null` because of an empty array as input", () => {
    const input: Array<Barcode> = [];
    const output = retrieveNextBarcode(input);

    expect(output).toBeNull();
  });

  it("should return the Data Matrix barcode because it's the only one", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.DATA_MATRIX } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe(BarcodeFormat.DATA_MATRIX);
  });

  it("should return the QR Code barcode because it's the only one", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.QR_CODE } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe(BarcodeFormat.QR_CODE);
  });
  it("should return the QR Code barcode because it has the higher priority", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.DATA_MATRIX } as Barcode,
      { format: BarcodeFormat.QR_CODE } as Barcode,
      { format: BarcodeFormat.CODE_128 } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe(BarcodeFormat.QR_CODE);
  });

  it("should return the Data Matrix barcode because it has the higher priority", () => {
    const input: Array<Barcode> = [
      { format: BarcodeFormat.CODE_39 } as Barcode,
      { format: BarcodeFormat.ITF } as Barcode,
      { format: BarcodeFormat.DATA_MATRIX } as Barcode,
      { format: BarcodeFormat.CODE_128 } as Barcode
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.format).toBe(BarcodeFormat.DATA_MATRIX);
  });
});

jest.mock("react-native-vision-camera", () => ({}));

describe("test useIOBarcodeScanner hook", () => {
  it("", () => {
    const test = useIOBarcodeScanner();
  });
});
