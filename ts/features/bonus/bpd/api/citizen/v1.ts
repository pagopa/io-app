import { left } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as r from "italia-ts-commons/lib/requests";
import {
  ApiHeaderJson,
  composeHeaderProducers,
  MapResponseType
} from "italia-ts-commons/lib/requests";
import { CitizenPatchDTO } from "../../../../../../definitions/bpd/citizen/CitizenPatchDTO";
import {
  enrollmentDecoder,
  EnrollmentT,
  findRankingUsingGETDefaultDecoder,
  FindRankingUsingGETT,
  findUsingGETDecoder,
  FindUsingGETT
} from "../../../../../../definitions/bpd/citizen/requestTypes";
import { bpdHeadersProducers } from "../common";
import { PatchedCitizenResource } from "../patchedTypes";

/* CITIZEN (status, enroll, delete) */
/**
 * @deprecated
 */
type FindUsingGETTExtra = MapResponseType<
  FindUsingGETT,
  200,
  PatchedCitizenResource
>;

/**
 * @deprecated
 */
export const citizenFindGET: FindUsingGETTExtra = {
  method: "get",
  url: () => `/bpd/io/citizen`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findUsingGETDecoder(PatchedCitizenResource)
};

/**
 * @deprecated
 */
type EnrollmentTTExtra = MapResponseType<
  EnrollmentT,
  200,
  PatchedCitizenResource
>;

/**
 * @deprecated
 */
export const citizenEnrollPUT: EnrollmentTTExtra = {
  method: "put",
  url: () => `/bpd/io/citizen`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(bpdHeadersProducers(), ApiHeaderJson),
  response_decoder: enrollmentDecoder(PatchedCitizenResource)
};

const deleteResponseDecoders = r.composeResponseDecoders(
  r.composeResponseDecoders(
    r.constantResponseDecoder<undefined, 204>(204, undefined),
    r.constantResponseDecoder<undefined, 401>(401, undefined)
  ),
  r.constantResponseDecoder<undefined, 404>(404, undefined)
);

// these responses code/codec are built from api usage and not from API spec
type DeleteUsingDELETETExtra = r.IDeleteApiRequestType<
  {
    readonly Authorization: string;
    readonly x_request_id?: string;
  },
  never,
  never,
  | r.IResponseType<204, undefined>
  | r.IResponseType<401, undefined>
  | r.IResponseType<404, undefined>
  | r.IResponseType<500, undefined>
>;

export const citizenDELETE: DeleteUsingDELETETExtra = {
  method: "delete",
  url: () => `/bpd/io/citizen`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: deleteResponseDecoders
};

/* citizen ranking (super cashback) */
export const citizenRankingGET: FindRankingUsingGETT = {
  method: "get",
  url: () => `/bpd/io/citizen/ranking`,
  query: (_: { awardPeriodId?: string }) => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findRankingUsingGETDefaultDecoder()
};

export type PatchOptions = {
  baseUrl: string;
  fetchApi: typeof fetch;
};

/* Patch IBAN */
const PatchIban = t.interface({ validationStatus: t.string });
type PatchIban = t.TypeOf<typeof PatchIban>;

type finalType =
  | r.IResponseType<200, PatchIban>
  | r.IResponseType<401, undefined>
  | r.IResponseType<404, undefined>
  | r.IResponseType<400, undefined>
  | r.IResponseType<500, undefined>;

// decoders composition to handle updatePaymentMethod response
export function patchIbanDecoders<A, O>(type: t.Type<A, O>) {
  return r.composeResponseDecoders(
    r.composeResponseDecoders(
      r.composeResponseDecoders(
        r.ioResponseDecoder<200, typeof type["_A"], typeof type["_O"]>(
          200,
          type
        ),
        r.composeResponseDecoders(
          r.constantResponseDecoder<undefined, 400>(400, undefined),
          r.constantResponseDecoder<undefined, 401>(401, undefined)
        )
      ),
      r.constantResponseDecoder<undefined, 404>(404, undefined)
    ),
    r.constantResponseDecoder<undefined, 500>(500, undefined)
  );
}

// custom implementation of patch request
// TODO abstract the usage of fetch
export const citizenPaymentMethodPATCH = (
  options: PatchOptions,
  token: string,
  payload: CitizenPatchDTO,
  headers: Record<string, string>
): (() => Promise<t.Validation<finalType>>) => async () => {
  const response = await options.fetchApi(`${options.baseUrl}/bpd/io/citizen`, {
    method: "patch",
    headers: { ...headers, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const decode = await patchIbanDecoders(PatchIban)(response);
  return (
    decode ??
    left([
      {
        context: [],
        value: response
      }
    ])
  );
};
