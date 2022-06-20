import {
  ApiHeaderJson,
  composeHeaderProducers,
  MapResponseType
} from "@pagopa/ts-commons/lib/requests";
import {
  enrollmentDecoder,
  EnrollmentT as EnrollmentTV2,
  findRankingUsingGETDefaultDecoder,
  FindRankingUsingGETT,
  findUsingGETDecoder,
  FindUsingGETT as FindUsingGETTV2
} from "../../../../../../definitions/bpd/citizen_v2/requestTypes";
import { bpdHeadersProducers } from "../common";
import { PatchedCitizenV2Resource } from "../patchedTypes";

type FindV2UsingGETTExtra = MapResponseType<
  FindUsingGETTV2,
  200,
  PatchedCitizenV2Resource
>;

const findUsingGETCustomDecoder = findUsingGETDecoder({
  200: PatchedCitizenV2Resource
});

export const citizenV2FindGET: FindV2UsingGETTExtra = {
  method: "get",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findUsingGETCustomDecoder
};

type EnrollmentV2TTExtra = MapResponseType<
  EnrollmentTV2,
  200,
  PatchedCitizenV2Resource
>;

const enrollmentCustomDecoder = enrollmentDecoder({
  200: PatchedCitizenV2Resource
});

export const citizenV2EnrollPUT: EnrollmentV2TTExtra = {
  method: "put",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  body: ({ optInStatus }) => JSON.stringify(optInStatus ? { optInStatus } : {}),
  headers: composeHeaderProducers(bpdHeadersProducers(), ApiHeaderJson),
  response_decoder: enrollmentCustomDecoder
};

/**
 * Request the user ranking + milestone information, containing the trxPivot
 */
export const citizenV2RankingGET: FindRankingUsingGETT = {
  method: "get",
  url: () => `/bpd/io/citizen/v2/ranking`,
  query: (_: { awardPeriodId?: string }) => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findRankingUsingGETDefaultDecoder()
};
