import {
  AmountInEuroCents,
  PaymentNoticeQrCodeFromString,
  RptId,
  rptIdFromPaymentNoticeQrCode
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { decodePosteDataMatrix } from "../../../utils/payment";
import { ItwRemoteRequestPayload } from "../../itwallet/presentation/remote/utils/itwRemoteTypeUtils";
import { validateItwPresentationQrCodeParams } from "../../itwallet/presentation/remote/utils/itwRemotePresentationUtils";
import { IOBarcodeType } from "./IOBarcode";

// Discriminated barcode type
// Represents the decoded content of a barcode that has been scanned
// To add a new barcode type, add a new type here and add the decoder function to the IOBarcodeDecoders object
//
// Example:
//
// type SupportedDecodedIOBarcode =
//  | {
//      type: "IDPAY";
//      authUrl: string;
//      trxCode: string;
//    }
//  | {
//      type: "PAGOPA";
//      rptId: RptId;
//      amount: AmountInEuroCents;
//    }
//  | {                                 <--
//      type: "MY_NEW_BARCODE_TYPE";    <-- New barcode type
//      content: string;                <--
//    };                                <--
export type DecodedIOBarcode =
  | {
      type: "PAGOPA";
      rptId: RptId;
      amount: AmountInEuroCents;
    }
  | {
      type: "IDPAY";
      authUrl: string;
      trxCode: string;
    }
  | {
      type: "FCI";
      signatureRequestId: SignatureRequestDetailView["id"];
    }
  | {
      type: "ITW_REMOTE";
      itwRemoteRequestPayload: ItwRemoteRequestPayload;
    };

// Barcode decoder function which is used to determine the type and content of a barcode
type IOBarcodeDecoderFn = (data: string) => O.Option<DecodedIOBarcode>;

type IOBarcodeDecodersType = {
  [K in IOBarcodeType]: IOBarcodeDecoderFn;
};

const decodeIdPayBarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data.match(
      /^https:\/\/continua\.io\.pagopa\.it\/idpay\/auth\/([a-zA-Z0-9]{8})$/
    ),
    O.fromNullable,
    O.map(m => ({ type: "IDPAY", authUrl: m[0], trxCode: m[1] }))
  );

const decodePagoPAQRCode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    PaymentNoticeQrCodeFromString.decode(data),
    E.chain(paymentNotice =>
      pipe(
        rptIdFromPaymentNoticeQrCode(paymentNotice),
        E.map(
          rptId =>
            ({ type: "PAGOPA", rptId, amount: paymentNotice.amount } as const)
        )
      )
    ),
    O.fromEither
  );

const decodePagoPADataMatrix: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data,
    decodePosteDataMatrix,
    O.map(({ e1, e2 }) => ({ type: "PAGOPA", rptId: e1, amount: e2 } as const))
  );

const decodePagoPABarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data,
    decodePagoPADataMatrix,
    O.alt(() => decodePagoPAQRCode(data))
  );

const decodeFciBarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data.match(
      /^https:\/\/continua\.io\.pagopa\.it\/fci\/main\?signatureRequestId=([a-zA-Z0-9]+)$/
    ),
    O.fromNullable,
    O.map(m => ({
      type: "FCI",
      signatureRequestId: m[1] as SignatureRequestDetailView["id"]
    }))
  );

const decodeItwRemoteBarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    O.fromNullable(
      data.match(/^https:\/\/continua\.io\.pagopa\.it\/itw\/auth\?(.*)$/)
    ),
    O.map(match => new URLSearchParams(match[1])),
    O.chainEitherK(params =>
      validateItwPresentationQrCodeParams({
        client_id: params.get("client_id"),
        request_uri: params.get("request_uri"),
        state: params.get("state"),
        request_uri_method: params.get(
          "request_uri_method"
        ) as ItwRemoteRequestPayload["request_uri_method"]
      })
    ),
    O.map(itwRemoteRequestPayload => ({
      type: "ITW_REMOTE",
      itwRemoteRequestPayload
    }))
  );

// Each type comes with its own decoded function which is used to identify the barcode content
// To add a new barcode type, add a new entry to this object
//
// Example:
//
// export const IOBarcodeDecoders: IOBarcodeDecodersType = {
//   IDPAY: decodeIdPayBarcode,
//   PAGOPA: decodePagoPABarcode,
//   MY_NEW_BARCODE_TYPE: decodeMyNewBarcodeType
// };
export const IOBarcodeDecoders: IOBarcodeDecodersType = {
  IDPAY: decodeIdPayBarcode,
  PAGOPA: decodePagoPABarcode,
  FCI: decodeFciBarcode,
  ITW_REMOTE: decodeItwRemoteBarcode
};

type DecodeOptions = {
  /**
   * List of barcode types to decode
   * If not specified, all barcode types are decoded
   */
  barcodeTypes?: ReadonlyArray<IOBarcodeType>;
};

/**
 * Returns the type of a barcode. Fallbacks to "UNKNOWN" if no type is found
 * @param value Barcode content
 * @returns DecodedIOBarcode {@see DecodedIOBarcode}
 */
export const decodeIOBarcode = (
  value: string | undefined,
  options?: DecodeOptions
): O.Option<DecodedIOBarcode> =>
  pipe(
    value,
    O.fromNullable,
    O.map(NonEmptyString.decode),
    O.chain(O.fromEither),
    O.map(value =>
      Object.entries(IOBarcodeDecoders)
        .filter(
          ([type]) =>
            options?.barcodeTypes?.includes(type as IOBarcodeType) ?? true
        )
        .map(([_, decode]) => decode(value.trim()))
    ),
    O.map(A.compact),
    O.chain(A.head)
  );

/**
 * Barcode decoding for multiple values
 * @param values List of barcode contens
 * @returns A list of DecodedIOBarcode {@see DecodedIOBarcode} if at least one barcode is decoded
 */
export const decodeMultipleIOBarcodes = (
  values: Array<string> | undefined,
  options?: DecodeOptions
): O.Option<Array<DecodedIOBarcode>> =>
  pipe(
    values,
    O.fromNullable,
    O.map(A.map(value => decodeIOBarcode(value, options))),
    O.map(A.compact),
    O.filter(A.isNonEmpty)
  );
