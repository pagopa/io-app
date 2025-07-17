import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Eq } from "fp-ts/lib/string";
import { QRCodeDetectOptions, CodeType as RNQRCodeType } from "rn-qr-generator";
import { GlobalState } from "../../../store/reducers/types";
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
 * Checks if the detected barcode format is supported
 * @param type RNQRCodeType
 * @param barcodeFormats Accepted formats
 * @returns TE.Left if the format is not supported, TE.Right with the converted format otherwise
 */
const checkDetectedBarcodesFormat = (
  type: RNQRCodeType,
  barcodeFormats?: Array<IOBarcodeFormat>
): TE.TaskEither<BarcodeFailure, IOBarcodeFormat> =>
  pipe(
    convertToIOBarcodeFormat(type),
    O.filter(format => barcodeFormats?.includes(format) ?? true),
    TE.fromOption<BarcodeFailure>(() => ({
      reason: "UNSUPPORTED_FORMAT"
    }))
  );

/**
 * Checks if the detected barcodes array is not empty after removing duplicates
 * @param barcodes List of detected barcodes
 * @returns TE.Left if the array is empty, TE.Right with the array otherwise
 */
const checkDetectedBarcodesArray = (
  barcodes: Array<string>
): TE.TaskEither<BarcodeFailure, Array<string>> =>
  pipe(
    O.of(barcodes),
    O.filter(A.isNonEmpty),
    O.map(A.uniq(Eq)),
    TE.fromOption<BarcodeFailure>(() => ({
      reason: "BARCODE_NOT_FOUND"
    }))
  );

/**
 * Decodes the detected barcodes into IOBarcode objects
 * @param barcodes List of detected barcodes
 * @param format Format of the detected barcodes
 * @param state Global redux state of the application
 * @param barcodeTypes Accepted types of the detected barcodes
 * @returns TE.Left if the content is not supported, TE.Right with the decoded barcodes otherwise
 */
const decodeDetectedBarcodes = (
  barcodes: Array<string>,
  format: IOBarcodeFormat,
  state: GlobalState,
  barcodeTypes?: Array<IOBarcodeType>
): TE.TaskEither<BarcodeFailure, Array<IOBarcode>> =>
  pipe(
    decodeMultipleIOBarcodes(state, barcodes, { barcodeTypes }),
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
      content: barcodes.join(",")
    }))
  );

/**
 * Creates a TaskEither that decodes a barcodes from an image URI
 * @param state Global redux state of the application
 * @param detectOptions object which may contain the uri or the base64 of the image
 * @param barcodeFormats The accepted formats of the barcodes
 * @param acceptedTypes The accepted types of the barcodes
 * @returns Array of decoded barcodes
 */
export const imageDecodingTask = (
  state: GlobalState,
  detectOptions: QRCodeDetectOptions,
  barcodeFormats?: Array<IOBarcodeFormat>,
  barcodeTypes?: Array<IOBarcodeType>
): TE.TaskEither<BarcodeFailure, Array<IOBarcode>> =>
  pipe(
    barcodeDetectionTask(detectOptions),
    TE.chain(({ type, values }) =>
      pipe(
        sequenceS(TE.Monad)({
          // Checks if the barcode format is supported
          format: checkDetectedBarcodesFormat(type, barcodeFormats),
          // Checks if the array of barcodes is not empty after removing duplicates
          values: checkDetectedBarcodesArray(values)
        })
      )
    ),
    TE.chain(({ format, values }) =>
      // Decodes the detected barcodes and check if the content is supported
      decodeDetectedBarcodes(values, format, state, barcodeTypes)
    )
  );
