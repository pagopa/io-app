import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { ItwRemoteBarcode } from "../../../../barcode/types/IOBarcode.ts";

export const getUrlParam = (url: string, paramName: string): O.Option<string> =>
  pipe(
    O.tryCatch(() => new URL(url)),
    O.chainNullableK(({ searchParams }) => searchParams.get(paramName))
  );

/**
 * This function constructs a deep link by encoding the itwRemoteRequestPayload
 * as a URI component to ensure safe transmission via URL parameters.
 * Encoding prevents issues with special characters that could break the URL format.
 * @param {ItwRemoteBarcode} barcode - The barcode containing the remote request payload, which
 * can originate from a deep link or a QR code generated from the RP page
 * @returns {string} - The formatted deep link URL.
 */
export const buildItwRemoteRequestDeepLink = (barcode: ItwRemoteBarcode) =>
  pipe(
    barcode.itwRemoteRequestPayload,
    payload => JSON.stringify(payload),
    encodeURIComponent,
    encodedPayload =>
      `${barcode.baseAuthUrl}/eid-claims-selection?itwRemoteRequestPayload=${encodedPayload}`
  );
