import * as O from "fp-ts/lib/Option";
import { Code } from "react-native-vision-camera";
import { retrieveNextBarcode } from "../useIOBarcodeCameraScanner";
import { BarcodeFormat } from "../../types/IOBarcode";

describe("test retrieveNextBarcode function", () => {
  it("should return `O.none` because of an empty array as input", () => {
    const input: Array<Code> = [];
    const output = retrieveNextBarcode(input);

    expect(output).toStrictEqual(O.none);
  });

  it("should return the Data Matrix barcode because it's the only one", () => {
    const input: Array<Code> = [{ type: BarcodeFormat.DATA_MATRIX }];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.type).toBe(BarcodeFormat.DATA_MATRIX);
  });

  it("should return the QR Code barcode because it's the only one", () => {
    const input: Array<Code> = [{ type: BarcodeFormat.QR_CODE }];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.type).toBe(BarcodeFormat.QR_CODE);
  });
  it("should return the QR Code barcode because it has the higher priority", () => {
    const input: Array<Code> = [
      { type: BarcodeFormat.DATA_MATRIX },
      { type: BarcodeFormat.QR_CODE },
      { type: BarcodeFormat.CODE_128 }
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.type).toBe(BarcodeFormat.QR_CODE);
  });

  it("should return the Data Matrix barcode because it has the higher priority", () => {
    const input: Array<Code> = [
      { type: BarcodeFormat.CODE_39 },
      { type: BarcodeFormat.ITF },
      { type: BarcodeFormat.DATA_MATRIX },
      { type: BarcodeFormat.CODE_128 }
    ];

    const output = O.toUndefined(retrieveNextBarcode(input));

    expect(output?.type).toBe(BarcodeFormat.DATA_MATRIX);
  });
});
