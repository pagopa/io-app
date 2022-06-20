/* PAYMENT (status, enroll, delete) */
import * as r from "@pagopa/ts-commons/lib/requests";
import {
  ApiHeaderJson,
  composeHeaderProducers
} from "@pagopa/ts-commons/lib/requests";
import {
  DeleteUsingDELETET,
  enrollmentPaymentInstrumentIOUsingPUTDefaultDecoder,
  EnrollmentPaymentInstrumentIOUsingPUTT,
  findUsingGETDefaultDecoder,
  FindUsingGETT as FindPaymentUsingGETT
} from "../../../../../../definitions/bpd/payment/requestTypes";
import { bpdHeadersProducers } from "../common";

export const paymentInstrumentsFindGET: FindPaymentUsingGETT = {
  method: "get",
  url: ({ id }) => `/bpd/io/payment-instruments/${id}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findUsingGETDefaultDecoder()
};

export const paymentInstrumentsEnrollPUT: EnrollmentPaymentInstrumentIOUsingPUTT =
  {
    method: "put",
    url: ({ id }) => `/bpd/io/payment-instruments/${id}`,
    query: _ => ({}),
    body: () => "",
    headers: composeHeaderProducers(ApiHeaderJson, bpdHeadersProducers()),
    response_decoder: enrollmentPaymentInstrumentIOUsingPUTDefaultDecoder()
  };

const deletePaymentResponseDecoders = r.composeResponseDecoders(
  r.composeResponseDecoders(
    r.constantResponseDecoder<undefined, 204>(204, undefined),
    r.constantResponseDecoder<undefined, 400>(400, undefined)
  ),
  r.composeResponseDecoders(
    r.constantResponseDecoder<undefined, 401>(401, undefined),
    r.constantResponseDecoder<undefined, 500>(500, undefined)
  )
);

export const paymentInstrumentsDELETE: DeleteUsingDELETET = {
  method: "delete",
  url: ({ id }) => `/bpd/io/payment-instruments/${id}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: deletePaymentResponseDecoders
};
