// FIX ME: remove this mocked Types when a new backend definition that includes the real ones is released.
// Jira: https://pagopa.atlassian.net/browse/IOPID-264

import {
  composeResponseDecoders as compD,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  ResponseDecoder
} from "@pagopa/ts-commons/lib/requests";
import * as t from "io-ts";

import { ProblemJson } from "../../../../../definitions/backend/ProblemJson";

// ------------ Nonce ---------------------

export const NonceResponse = t.interface({
  nonce: t.string
});

export type GetNonceT = IPostApiRequestType<
  never,
  "Content-Type",
  never,
  NonceBaseResponseType<NonceResponse>
>;

export type NonceBaseResponseType<R> =
  | IResponseType<200, R>
  | IResponseType<404, ProblemJson>
  | IResponseType<500, ProblemJson>;

export type NonceResponse = t.TypeOf<typeof NonceResponse>;

export function getFastLoginNonceDecoder<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<NonceBaseResponseType<R>> {
  return compD(
    ioD<200, R, O>(200, type),
    compD(
      ioD<404, ProblemJson>(404, ProblemJson),
      ioD<500, ProblemJson>(500, ProblemJson)
    )
  );
}
