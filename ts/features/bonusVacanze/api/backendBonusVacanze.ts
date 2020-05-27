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
import { ProblemJson } from "../../../../definitions/backend/ProblemJson";
import { defaultRetryingFetch } from "../../../utils/fetch";
import { BonusList, BonusListT } from "../types/bonusList";
import {
  EligibilityCheck,
  EligibilityCheckT,
  EligibilityId,
  EligibilityIdT
} from "../types/eligibility";

type GetBonusListT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BonusList>
>;

type EligibilityCheckT = IGetApiRequestType<
  {},
  never,
  never,
  // tslint:disable-next-line: max-union-size
  | IResponseType<200, EligibilityCheck>
  | IResponseType<202, EligibilityCheck>
  | IResponseType<401, undefined>
  | IResponseType<404, undefined>
  | IResponseType<500, ProblemJson>
>;

function getEligibilityCheckDecoder<A, O>(type: t.Type<A, O>) {
  return composeResponseDecoders(
    composeResponseDecoders(
      composeResponseDecoders(
        composeResponseDecoders(
          ioResponseDecoder<200, (typeof type)["_A"], (typeof type)["_O"]>(
            200,
            type
          ),
          ioResponseDecoder<
            202,
            (typeof EligibilityIdT)["_A"],
            (typeof EligibilityIdT)["_O"]
          >(202, EligibilityIdT)
        ),
        constantResponseDecoder<undefined, 401>(401, undefined)
      ),
      constantResponseDecoder<undefined, 404>(404, undefined)
    ),
    ioResponseDecoder<
      500,
      (typeof ProblemJson)["_A"],
      (typeof ProblemJson)["_O"]
    >(500, ProblemJson)
  );
}

type StartEligibilityCheckT = IPostApiRequestType<
  {},
  never,
  never,
  // tslint:disable-next-line: max-union-size
  | IResponseType<202, EligibilityId>
  | IResponseType<409, ProblemJson>
  | IResponseType<401, undefined>
  | IResponseType<500, ProblemJson>
>;

function postEligibilityCheckDecoder<A, O>(type: t.Type<A, O>) {
  return composeResponseDecoders(
    composeResponseDecoders(
      composeResponseDecoders(
        ioResponseDecoder<202, (typeof type)["_A"], (typeof type)["_O"]>(
          202,
          type
        ),
        ioResponseDecoder<
          409,
          (typeof ProblemJson)["_A"],
          (typeof ProblemJson)["_O"]
        >(409, ProblemJson)
      ),
      constantResponseDecoder<undefined, 401>(401, undefined)
    ),

    ioResponseDecoder<
      500,
      (typeof ProblemJson)["_A"],
      (typeof ProblemJson)["_O"]
    >(500, ProblemJson)
  );
}

const startEligibilityCheckT: StartEligibilityCheckT = {
  method: "post",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  body: _ => "",
  headers: () => ({ "Content-Type": "application/json" }),
  response_decoder: postEligibilityCheckDecoder(EligibilityIdT)
};

const eligibilityCheckT: EligibilityCheckT = {
  method: "get",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: getEligibilityCheckDecoder(EligibilityCheckT)
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
    postEligibilityCheck: createFetchRequestForApi(
      startEligibilityCheckT,
      options
    ),
    getEligibilityCheck: createFetchRequestForApi(eligibilityCheckT, options)
  };
}
