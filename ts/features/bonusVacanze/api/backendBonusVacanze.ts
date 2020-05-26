import * as t from "io-ts";
import {
  basicResponseDecoder,
  BasicResponseType,
  composeResponseDecoders,
  constantResponseDecoder,
  createFetchRequestForApi,
  IGetApiRequestType,
  ioResponseDecoder,
  IPostApiRequestType,
  IResponseType
} from "italia-ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../utils/fetch";
import { BonusList, BonusListT } from "../types/bonusList";
import { EligibilityCheck, EligibilityCheckT } from "../types/eligibility";

type GetBonusListT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BonusList>
>;

type StartEligibilityCheckT = IPostApiRequestType<
  {},
  never,
  never,
  // tslint:disable-next-line: max-union-size
  | IResponseType<200, EligibilityCheck>
  | IResponseType<202, EligibilityCheck>
  | IResponseType<409, EligibilityCheck>
  | IResponseType<404, undefined>
  | IResponseType<500, undefined>
>;

type EligibilityCheckT = IGetApiRequestType<
  {},
  never,
  never,
  // tslint:disable-next-line: max-union-size
  | IResponseType<200, EligibilityCheck>
  | IResponseType<202, EligibilityCheck>
  | IResponseType<409, EligibilityCheck>
  | IResponseType<404, undefined>
  | IResponseType<500, undefined>
>;

function startEligibilityCheckDecoder<A, O>(type: t.Type<A, O>) {
  return composeResponseDecoders(
    composeResponseDecoders(
      composeResponseDecoders(
        composeResponseDecoders(
          ioResponseDecoder<200, (typeof type)["_A"], (typeof type)["_O"]>(
            200,
            type
          ),
          ioResponseDecoder<202, (typeof type)["_A"], (typeof type)["_O"]>(
            202,
            type
          )
        ),
        ioResponseDecoder<409, (typeof type)["_A"], (typeof type)["_O"]>(
          409,
          type
        )
      ),
      constantResponseDecoder<undefined, 404>(404, undefined)
    ),
    constantResponseDecoder<undefined, 500>(500, undefined)
  );
}

const startEligibilityCheckT: StartEligibilityCheckT = {
  method: "post",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  body: _ => "",
  headers: () => ({ "Content-Type": "application/json" }),
  response_decoder: startEligibilityCheckDecoder(EligibilityCheckT)
};

const eligibilityCheckT: EligibilityCheckT = {
  method: "get",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: startEligibilityCheckDecoder(EligibilityCheckT)
};

const getAvailableBonusesT: GetBonusListT = {
  method: "get",
  url: () => `/bonus/vacanze`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(BonusListT)
};

//
// A specific backend client to handle bonus vacanze requests
//
export function BackendBonusVacanze(
  baseUrl: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  return {
    getAvailableBonuses: createFetchRequestForApi(
      getAvailableBonusesT,
      options
    ),
    startEligibilityCheck: createFetchRequestForApi(
      startEligibilityCheckT,
      options
    ),
    eligibilityCheck: createFetchRequestForApi(eligibilityCheckT, options)
  };
}
