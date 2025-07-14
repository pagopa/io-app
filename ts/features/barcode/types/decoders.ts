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
import { GlobalState } from "../../../store/reducers/types";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { decodePosteDataMatrix } from "../../../utils/payment";
import { ItwRemoteRequestPayload } from "../../itwallet/presentation/remote/utils/itwRemoteTypeUtils";
import { validateItwPresentationQrCodeParams } from "../../itwallet/presentation/remote/utils/itwRemotePresentationUtils";
import { pnAARQRCodeRegexSelector } from "../../../store/reducers/backendStatus/remoteConfig";
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
type StaticDecodedIOBarcode =
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
type RuntimeDecodedIOBarcode = {
  type: "SEND";
  qrCodeContent: string;
};
export type DecodedIOBarcode = StaticDecodedIOBarcode | RuntimeDecodedIOBarcode;

// Barcode decoder function which is used to determine the type and content of a barcode
type IOBarcodeStaticDecoderFn = (data: string) => O.Option<DecodedIOBarcode>;
type IOBarcodeRuntimeDecoderFn = (
  state: GlobalState,
  data: string
) => O.Option<DecodedIOBarcode>;
type IOBarcodeDecoderFn = IOBarcodeStaticDecoderFn | IOBarcodeRuntimeDecoderFn;

type IOBarcodeStaticDecodersType = {
  [K in StaticDecodedIOBarcode["type"]]: IOBarcodeStaticDecoderFn;
};

type IOBarcodeRuntimeDecodersType = {
  [K in RuntimeDecodedIOBarcode["type"]]: IOBarcodeRuntimeDecoderFn;
};

const decodeIdPayBarcode: IOBarcodeStaticDecoderFn = (data: string) =>
  pipe(
    data.match(
      /^https:\/\/continua\.io\.pagopa\.it\/idpay\/auth\/([a-zA-Z0-9]{8})$/
    ),
    O.fromNullable,
    O.map(m => ({ type: "IDPAY", authUrl: m[0], trxCode: m[1] }))
  );

const decodePagoPAQRCode: IOBarcodeStaticDecoderFn = (data: string) =>
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

const decodePagoPADataMatrix: IOBarcodeStaticDecoderFn = (data: string) =>
  pipe(
    data,
    decodePosteDataMatrix,
    O.map(({ e1, e2 }) => ({ type: "PAGOPA", rptId: e1, amount: e2 } as const))
  );

const decodePagoPABarcode: IOBarcodeStaticDecoderFn = (data: string) =>
  pipe(
    data,
    decodePagoPADataMatrix,
    O.alt(() => decodePagoPAQRCode(data))
  );

const decodeFciBarcode: IOBarcodeStaticDecoderFn = (data: string) =>
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

const decodeItwRemoteBarcode: IOBarcodeStaticDecoderFn = (data: string) =>
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

const decodeSENDAARBarcode: IOBarcodeRuntimeDecoderFn = (
  state: GlobalState,
  data: string
) =>
  pipe(
    state,
    pnAARQRCodeRegexSelector,
    O.fromNullable,
    O.map(aarQRCodeRegexString => new RegExp(aarQRCodeRegexString, "i")),
    O.filter(aarQRCodeRegExp => aarQRCodeRegExp.test(data)),
    O.fold(
      () => O.none,
      _ => O.some({ type: "SEND", qrCodeContent: data })
    )
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
const StaticIOBarcodeDecoders: IOBarcodeStaticDecodersType = {
  IDPAY: decodeIdPayBarcode,
  PAGOPA: decodePagoPABarcode,
  FCI: decodeFciBarcode,
  ITW_REMOTE: decodeItwRemoteBarcode
};

const RuntimeIOBarcodeDecoders: IOBarcodeRuntimeDecodersType = {
  SEND: decodeSENDAARBarcode
};

export const IOBarcodeDecoders = {
  ...StaticIOBarcodeDecoders,
  ...RuntimeIOBarcodeDecoders
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
 * @param state Global redux state of the application
 * @param value Barcode content
 * @param options Options to filter the active barcode types
 * @returns DecodedIOBarcode {@see DecodedIOBarcode}
 */
export const decodeIOBarcode = (
  state: GlobalState,
  value: string | undefined,
  options?: DecodeOptions
): O.Option<DecodedIOBarcode> =>
  pipe(
    value,
    O.fromNullable,
    O.map(NonEmptyString.decode),
    O.chain(O.fromEither),
    O.map(nonEmptyStringValue => [
      ...Object.entries(StaticIOBarcodeDecoders)
        .filter(isDecoderTypeEnabled(options))
        .map(([_, decode]) => decode(nonEmptyStringValue.trim())),

      ...Object.entries(RuntimeIOBarcodeDecoders)
        .filter(isDecoderTypeEnabled(options))
        .map(([_, decode]) => decode(state, nonEmptyStringValue.trim()))
    ]),
    O.map(A.compact),
    O.chain(A.head)
  );

const isDecoderTypeEnabled =
  (options?: DecodeOptions) =>
  ([decoderType]: [string, IOBarcodeDecoderFn]): boolean =>
    options?.barcodeTypes?.includes(decoderType as IOBarcodeType) ?? true;

/**
 * Barcode decoding for multiple values
 * @param state Global redux state of the application
 * @param values List of barcode contens
 * @param options Options to filter the active barcode types
 * @returns A list of DecodedIOBarcode {@see DecodedIOBarcode} if at least one barcode is decoded
 */
export const decodeMultipleIOBarcodes = (
  state: GlobalState,
  values: Array<string> | undefined,
  options?: DecodeOptions
): O.Option<Array<DecodedIOBarcode>> =>
  pipe(
    values,
    O.fromNullable,
    O.map(A.map(value => decodeIOBarcode(state, value, options))),
    O.map(A.compact),
    O.filter(A.isNonEmpty)
  );
