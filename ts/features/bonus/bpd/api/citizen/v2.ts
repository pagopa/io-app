import {
  ApiHeaderJson,
  composeHeaderProducers,
  MapResponseType
} from "italia-ts-commons/lib/requests";
import {
  enrollmentDecoder,
  findUsingGETDecoder
} from "../../../../../../definitions/bpd/citizen/requestTypes";
import {
  EnrollmentT as EnrollmentTV2,
  FindUsingGETT as FindUsingGETTV2
} from "../../../../../../definitions/bpd/citizen_v2/requestTypes";
import { bpdHeadersProducers } from "../common";
import { PatchedCitizenV2Resource } from "../patchedTypes";

type FindV2UsingGETTExtra = MapResponseType<
  FindUsingGETTV2,
  200,
  PatchedCitizenV2Resource
>;

export const citizenV2FindGET: FindV2UsingGETTExtra = {
  method: "get",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findUsingGETDecoder(PatchedCitizenV2Resource)
};

type EnrollmentV2TTExtra = MapResponseType<
  EnrollmentTV2,
  200,
  PatchedCitizenV2Resource
>;

export const citizenV2EnrollPUT: EnrollmentV2TTExtra = {
  method: "put",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(bpdHeadersProducers(), ApiHeaderJson),
  response_decoder: enrollmentDecoder(PatchedCitizenV2Resource)
};
