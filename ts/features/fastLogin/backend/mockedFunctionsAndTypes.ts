import * as t from "io-ts";
import {
  composeResponseDecoders as compD,
  constantResponseDecoder as constD,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  ResponseDecoder
} from "@pagopa/ts-commons/lib/requests";
import { ProblemJson } from "../../../../definitions/backend/ProblemJson";
import { LollipopMethod } from "../../../../definitions/lollipop/LollipopMethod";
import { LollipopOriginalURL } from "../../../../definitions/lollipop/LollipopOriginalURL";
import { LollipopSignatureInput } from "../../../../definitions/lollipop/LollipopSignatureInput";
import { LollipopSignature } from "../../../../definitions/lollipop/LollipopSignature";

// ------------ Nonce ---------------------

export const NonceResponse = t.interface({
  nonce: t.string
});

export type NonceBaseResponseType<R> =
  | IResponseType<200, R>
  | IResponseType<404, ProblemJson>
  | IResponseType<500, ProblemJson>;

export type GetNonceT = IPostApiRequestType<
  never,
  "Content-Type",
  never,
  NonceBaseResponseType<NonceResponse>
>;

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

// --------- FastLogin ---------------

export const FastLoginResponse = t.interface({
  token: t.string
});

export type FastLoginResponse = t.TypeOf<typeof FastLoginResponse>;

export type FastLoginResponseType<R> =
  | IResponseType<200, R>
  | IResponseType<401, undefined>
  | IResponseType<403, undefined>
  | IResponseType<400, ProblemJson>
  | IResponseType<404, ProblemJson>
  | IResponseType<500, ProblemJson>;

export type FastLoginT = IPostApiRequestType<
  {
    readonly "x-pagopa-lollipop-original-method": LollipopMethod;
    readonly "x-pagopa-lollipop-original-url": LollipopOriginalURL;
    readonly "signature-input": LollipopSignatureInput;
    readonly signature: LollipopSignature;
  },
  "Content-Type",
  never,
  FastLoginResponseType<FastLoginResponse>
>;

export function fastLoginDecoder<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<FastLoginResponseType<R>> {
  return compD(
    compD(
      compD(ioD<200, R, O>(200, type), constD<undefined, 401>(401, undefined)),
      compD(
        constD<undefined, 403>(403, undefined),
        ioD<400, ProblemJson>(400, ProblemJson)
      )
    ),
    compD(
      ioD<404, ProblemJson>(404, ProblemJson),
      ioD<500, ProblemJson>(500, ProblemJson)
    )
  );
}
