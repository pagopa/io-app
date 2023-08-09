import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { QRCodeDetectOptions, CodeType as RNQRCodeType } from "rn-qr-generator";
import { IOBarcode, IOBarcodeFormat, IOBarcodeType } from "../types/IOBarcode";
import { decodeMultipleIOBarcodes } from "../types/decoders";
import { BarcodeFailure } from "../types/failure";
import { barcodeDetectionTask } from "./barcodeDetectionTask";

/**
 * Maps internal formats to external library formats
 * Necessary to work with the library {@link rn-qr-generator}
 */
const IOBarcodeFormats: { [K in IOBarcodeFormat]: RNQRCodeType } = {
  DATA_MATRIX: "DataMatrix",
  QR_CODE: "QRCode"
};

/**
 * Utility functions to map external formats to internal formats
 * Converts {@link RNQRCodeType} to {@link IOBarcodeFormat}.
 * Returns undefined if no format is found
 */
const convertToIOBarcodeFormat = (
  format: RNQRCodeType
): O.Option<IOBarcodeFormat> =>
  pipe(
    Object.entries(IOBarcodeFormats),
    A.findFirst(([_, value]) => value === format),
    O.map(([key, _]) => key as IOBarcodeFormat)
  );

/**
 * Creates a TaskEither that decodes a barcodes from an image URI
 * @param detectOptions object which may contain the uri or the base64 of the image
 * @param barcodeFormats The accepted formats of the barcodes
 * @param acceptedTypes The accepted types of the barcodes
 * @returns Array of decoded barcodes
 */
export const imageDecodingTask = (
  detectOptions: QRCodeDetectOptions,
  barcodeFormats?: Array<IOBarcodeFormat>,
  barcodeTypes?: Array<IOBarcodeType>
): TE.TaskEither<BarcodeFailure, Array<IOBarcode>> =>
  pipe(
    barcodeDetectionTask(detectOptions),
    // Check if any barcode is found
    // If none return TE.left with BARCODE_NOT_FOUND error
    TE.chain(result =>
      pipe(
        A.head(result.values),
        TE.fromOption<BarcodeFailure>(() => ({
          reason: "BARCODE_NOT_FOUND"
        })),
        TE.map(() => result)
      )
    ),
    // Check for valid barcode format
    // If the format is not supported return TE.left with UNSUPPORTED_FORMAT error
    TE.chain(result =>
      pipe(
        convertToIOBarcodeFormat(result.type),
        O.filter(format => barcodeFormats?.includes(format) ?? true),
        O.map(format => [result, format] as const),
        TE.fromOption<BarcodeFailure>(() => ({
          reason: "UNSUPPORTED_FORMAT"
        }))
      )
    ),
    // Check if any barcode was found
    // If none return TE.left with BARCODE_NOT_FOUND error
    TE.chain(([result, format]) =>
      pipe(
        result.values,
        O.fromNullable,
        O.filter(A.isNonEmpty),
        O.map(values => [values, format] as const),
        TE.fromOption<BarcodeFailure>(() => ({
          reason: "BARCODE_NOT_FOUND"
        }))
      )
    ),
    // Decode the barcode
    // If the barcode type is not supported return TE.left with UNKNOWN_CONTENT error
    TE.chain(([values, format]) =>
      pipe(
        decodeMultipleIOBarcodes(values, { barcodeTypes }),
        O.map(decodedBarcodes =>
          pipe(
            decodedBarcodes,
            A.map(decodedBarcode => ({
              format,
              ...decodedBarcode
            }))
          )
        ),
        TE.fromOption<BarcodeFailure>(() => ({
          reason: "UNKNOWN_CONTENT",
          format,
          content: values.join(",")
        }))
      )
    )
  );
