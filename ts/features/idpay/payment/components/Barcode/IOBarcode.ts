import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

export type IOBarcodeFormat = "DATA_MATRIX" | "QR_CODE";

// Supported types of barcode patterns that can be scanned
// To extend the list, add a new type and a new pattern to IOBarcodePatterns
type IOBarcodeTypeBase = "IDPAY";

export type IOBarcodeType = IOBarcodeTypeBase | "UNKNOWN";

// Function that checks if a string matches a barcode pattern
type IOBarcodeMatcherFunction = (content: string) => boolean;

type IOBarcodeMatchersType = {
  [K in IOBarcodeTypeBase]: IOBarcodeMatcherFunction;
};

const matchIdPayBarcode: IOBarcodeMatcherFunction =
  /^https:\/\/continua\.io\.pagopa\.it\/idpay\/auth\/([a-zA-Z0-9]{8})$/g.test;

// Types of barcode that can be scanned. Each type comes with its own matcher function
// which is used to identify the barcode content
const IOBarcodeMatchers: IOBarcodeMatchersType = {
  IDPAY: matchIdPayBarcode
};

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
      Object.entries(IOBarcodeMatchers).find(([_, matchFn]) =>
        matchFn(value.trim())
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
