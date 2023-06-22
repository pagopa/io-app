import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

export type IOBarcodeFormat = "DATA_MATRIX" | "QR_CODE";

// Supported types of barcode patterns that can be scanned
// To extend the list, add a new type and a new pattern to IOBarcodePatterns
type IOBarcodeTypeBase = "IDPAY";

type IOBarcodePatternsType = {
  [K in IOBarcodeTypeBase]: RegExp;
};

// Types of barcode that can be scanned. Each type comes with its own regex pattern
// which is used to validate the barcode content
const IOBarcodePatterns: IOBarcodePatternsType = {
  IDPAY: /^https:\/\/continua\.io\.pagopa\.it\/idpay\/auth\/([a-zA-Z0-9]{8})$/
};

export type IOBarcodeType = IOBarcodeTypeBase | "UNKNOWN";

/**
 * Returns the type of a barcode. Fallbacks to "unknown" if no type is found
 * @param value Barcode content
 * @returns Barcode type {@see IOBarcodeType}
 */
export const getIOBarcodeType = (value: string | undefined): IOBarcodeType =>
  pipe(
    value,
    O.fromNullable,
    O.map(value =>
      Object.entries(IOBarcodePatterns).find(([_, pattern]) =>
        pattern.test(value.trim())
      )
    ),
    O.chain(O.fromNullable),
    O.map(([type, _pattern]) => type as IOBarcodeType),
    O.getOrElse<IOBarcodeType>(() => "UNKNOWN")
  );

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = {
  format: IOBarcodeFormat;
  type: IOBarcodeType;
  value: string;
};
