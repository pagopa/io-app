import {
  AmountInEuroCents,
  PaymentNoticeQrCodeFromString,
  RptId,
  rptIdFromPaymentNoticeQrCode
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

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
type SupportedDecodedIOBarcode =
  | {
      type: "IDPAY";
      authUrl: string;
      trxCode: string;
    }
  | {
      type: "PAGOPA";
      rptId: RptId;
      amount: AmountInEuroCents;
    };

// Barcode decoder function which is used to determine the type and content of a barcode
type IOBarcodeDecoderFn = (data: string) => O.Option<DecodedIOBarcode>;

type IOBarcodeDecodersType = {
  [K in SupportedDecodedIOBarcode["type"]]: IOBarcodeDecoderFn;
};

const decodeIdPayBarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data.match(
      /^https:\/\/continua\.io\.pagopa\.it\/idpay\/auth\/([a-zA-Z0-9]{8})$/
    ),
    O.fromNullable,
    O.map(m => ({ type: "IDPAY", authUrl: m[0], trxCode: m[1] }))
  );

const decodePagoPABarcode: IOBarcodeDecoderFn = (data: string) =>
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
  PAGOPA: decodePagoPABarcode
};

/**
 * Returns the type of a barcode. Fallbacks to "UNKNOWN" if no type is found
 * @param value Barcode content
 * @returns DecodedIOBarcode {@see DecodedIOBarcode}
 */
export const decodeIOBarcode = (value: string | undefined): DecodedIOBarcode =>
  pipe(
    value,
    O.fromNullable,
    O.map(NonEmptyString.decode),
    O.chain(O.fromEither),
    O.map(value =>
      Object.entries(IOBarcodeDecoders).map(([_, decode]) =>
        decode(value.trim())
      )
    ),
    O.map(A.compact),
    O.chain(A.head),
    O.getOrElse<DecodedIOBarcode>(() => ({
      type: "UNKNOWN",
      value
    }))
  );

export type DecodedIOBarcode =
  | SupportedDecodedIOBarcode
  | { type: "UNKNOWN"; value?: string };
